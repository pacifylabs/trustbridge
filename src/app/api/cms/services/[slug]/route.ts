import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { deleteService, getServiceForAdmin, updateService } from '@/lib/cms/services';
import { serviceInputSchema, collectServiceFieldErrors } from '@/lib/validation/service';

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
  const service = await getServiceForAdmin(slug);
  if (!service) return NextResponse.json({ message: 'Service not found.' }, { status: 404 });
  return NextResponse.json({ service });
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

  const parsed = serviceInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Please correct the highlighted fields.',
        fieldErrors: collectServiceFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  try {
    const service = await updateService(slug, parsed.data);
    // Services also appear on the homepage grid and in the nav (every page,
    // via the shared layout), not just /services — see settings/route.ts for
    // the same reasoning.
    revalidatePath('/', 'layout');
    return NextResponse.json({ service });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the service.';
    return NextResponse.json({ message }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;
  await deleteService(slug);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
