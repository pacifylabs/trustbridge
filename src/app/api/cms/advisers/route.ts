import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { createAdviser, listAllAdvisers } from '@/lib/cms/advisers';
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const advisers = await listAllAdvisers();
  return NextResponse.json({ advisers });
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

  const parsed = adviserInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please correct the highlighted fields.', fieldErrors: collectAdviserFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const adviser = await createAdviser(parsed.data);
    // The Team section will also render on the homepage, not just /team.
    revalidatePath('/', 'layout');
    return NextResponse.json({ adviser }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create the adviser.';
    return NextResponse.json({ message }, { status: 409 });
  }
}
