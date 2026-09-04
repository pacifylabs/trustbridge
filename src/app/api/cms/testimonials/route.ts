import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { createTestimonial, listAllTestimonials } from '@/lib/cms/testimonials';
import { testimonialInputSchema, collectTestimonialFieldErrors } from '@/lib/validation/testimonial';

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

  const testimonials = await listAllTestimonials();
  return NextResponse.json({ testimonials });
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

  const parsed = testimonialInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Please correct the highlighted fields.',
        fieldErrors: collectTestimonialFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  try {
    const testimonial = await createTestimonial(parsed.data);
    revalidatePath('/', 'layout');
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create the testimonial.';
    return NextResponse.json({ message }, { status: 409 });
  }
}
