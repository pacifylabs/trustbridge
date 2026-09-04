import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { deleteAdviser, getAdviserForAdmin, updateAdviser } from '@/lib/cms/advisers';
import { adviserInputSchema, collectAdviserFieldErrors } from '@/lib/validation/adviser';

function unauthorized(): NextResponse {
  return NextResponse.json({ message: 'Please sign in again.' }, { status: 401 });
}

function notConfigured(): NextResponse {
  return NextResponse.json(
    { message: "This part of the site isn't set up yet. Please contact your website developer." },
    { status: 503 },
  );
}

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;
  const adviser = await getAdviserForAdmin(slug);
  if (!adviser) return NextResponse.json({ message: 'Adviser not found.' }, { status: 404 });
  return NextResponse.json({ adviser });
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Could not read the submitted data.' }, { status: 400 });
  }

  const parsed = adviserInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please correct the highlighted fields.', fieldErrors: collectAdviserFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const adviser = await updateAdviser(slug, parsed.data);
    // The Team section will also render on the homepage, not just /team.
    revalidatePath('/', 'layout');
    return NextResponse.json({ adviser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the adviser.';
    return NextResponse.json({ message }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;
  await deleteAdviser(slug);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
