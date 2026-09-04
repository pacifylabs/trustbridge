import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { createService, listAllServices } from '@/lib/cms/services';
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const services = await listAllServices();
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

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
    const service = await createService(parsed.data);
    // Services also appear on the homepage grid and in the nav (every page,
    // via the shared layout), not just /services — see settings/route.ts for
    // the same reasoning.
    revalidatePath('/', 'layout');
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create the service.';
    return NextResponse.json({ message }, { status: 409 });
  }
}
