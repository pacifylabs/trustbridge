import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { getSettings, updateSettings, type CmsSettings } from '@/lib/cms/settings';

function unauthorized(): NextResponse {
  return NextResponse.json({ message: 'Please sign in again.' }, { status: 401 });
}

function notConfigured(): NextResponse {
  return NextResponse.json(
    { message: 'Settings are not configured yet. Set KV_REST_API_URL and KV_REST_API_TOKEN.' },
    { status: 503 },
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  return NextResponse.json({ settings: await getSettings() });
}

type BooleanSettingKey = 'siteLaunched' | 'featureComplexMatters' | 'featureBusinessImmigration';
const BOOLEAN_KEYS: readonly BooleanSettingKey[] = [
  'siteLaunched',
  'featureComplexMatters',
  'featureBusinessImmigration',
];

export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Could not read the submitted data.' }, { status: 400 });
  }

  if (typeof payload !== 'object' || payload === null) {
    return NextResponse.json({ message: 'Malformed settings payload.' }, { status: 422 });
  }

  const body = payload as Record<string, unknown>;
  const patch: { -readonly [K in keyof CmsSettings]?: CmsSettings[K] } = {};

  for (const key of BOOLEAN_KEYS) {
    if (key in body) {
      if (typeof body[key] !== 'boolean') {
        return NextResponse.json({ message: `${key} must be true or false.` }, { status: 422 });
      }
      patch[key] = body[key];
    }
  }

  if ('resourcesDataSource' in body) {
    if (body.resourcesDataSource !== 'demo' && body.resourcesDataSource !== 'cms') {
      return NextResponse.json(
        { message: 'resourcesDataSource must be "demo" or "cms".' },
        { status: 422 },
      );
    }
    patch.resourcesDataSource = body.resourcesDataSource;
  }

  const settings = await updateSettings(patch);

  // Every page whose content depends on these settings needs to be
  // revalidated, not just Resources: the launch flag affects the entire
  // site's metadata (see generateMetadata in app/layout.tsx).
  revalidatePath('/', 'layout');
  // robots.txt and sitemap.xml read the same launch flag but are their own
  // route entries, outside '/'s layout tree, so the call above never reaches
  // them — without this, flipping "Publish the site" leaves search engines
  // reading a stale "disallow everything" / empty sitemap for up to the
  // settings cache's own revalidate window.
  revalidatePath('/robots.txt');
  revalidatePath('/sitemap.xml');

  return NextResponse.json({ settings });
}
