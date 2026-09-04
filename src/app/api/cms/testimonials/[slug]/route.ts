import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isCmsConfigured } from '@/lib/env';
import { hasAdminSessionFromRequest } from '@/lib/cms/auth';
import { deleteTestimonial, getTestimonialForAdmin, updateTestimonial } from '@/lib/cms/testimonials';
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

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;
  const testimonial = await getTestimonialForAdmin(slug);
  if (!testimonial) return NextResponse.json({ message: 'Testimonial not found.' }, { status: 404 });
  return NextResponse.json({ testimonial });
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
    const testimonial = await updateTestimonial(slug, parsed.data);
    revalidatePath('/', 'layout');
    return NextResponse.json({ testimonial });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the testimonial.';
    return NextResponse.json({ message }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  if (!hasAdminSessionFromRequest(request)) return unauthorized();
  if (!isCmsConfigured()) return notConfigured();

  const { slug } = await params;
  await deleteTestimonial(slug);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
