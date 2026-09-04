import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { getContactForAdmin, updateContactInfo } from '@/lib/cms/contact';
import { contactInputSchema, collectContactFieldErrors } from '@/lib/validation/contact';

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

  const contact = await getContactForAdmin();
  return NextResponse.json({ contact });
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Could not read the submitted data.' }, { status: 400 });
  }

  const parsed = contactInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Please correct the highlighted fields.',
        fieldErrors: collectContactFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  await updateContactInfo(parsed.data);
  // Contact details appear in the header, footer and CTA band on every page.
  revalidatePath('/', 'layout');

  return NextResponse.json({ contact: parsed.data });
}
