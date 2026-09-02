import { NextResponse } from 'next/server';
import { sendEnquiryEmail } from '@/lib/email';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { collectFieldErrors, enquirySchema, isHoneypotFilled } from '@/lib/validation/enquiry';

/**
 * Enquiry endpoint.
 *
 * There is no database: a submission is validated, checked for spam, and
 * emailed straight to the shared inbox. If the email fails to send, the
 * visitor is told plainly rather than shown a false confirmation, since
 * nothing else records that they got in touch.
 */

const DELIVERY_FAILED_MESSAGE =
  'We could not send your enquiry. Please email or call us directly using the details on this page.';

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Could not read the submitted data.' }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Please correct the highlighted fields and try again.',
        fieldErrors: collectFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  // Honeypot. A filled field means a bot, so acknowledge without acting on it:
  // returning an error would tell the bot which field gave it away.
  if (isHoneypotFilled(parsed.data)) {
    return NextResponse.json(
      { message: 'Thank you. Your enquiry has been received and we will be in touch.' },
      { status: 200 },
    );
  }

  const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const recaptchaOk = await verifyRecaptcha(parsed.data.recaptchaToken, remoteIp);

  if (!recaptchaOk) {
    return NextResponse.json(
      {
        message: 'Please correct the highlighted fields and try again.',
        fieldErrors: { recaptchaToken: 'Please confirm the reCAPTCHA check and try again.' },
      },
      { status: 422 },
    );
  }

  // The payload contains personal data and must not reach application logs;
  // only the outcome of sending it is ever logged, inside sendEnquiryEmail.
  const { ok } = await sendEnquiryEmail(parsed.data);

  if (!ok) {
    return NextResponse.json({ message: DELIVERY_FAILED_MESSAGE }, { status: 502 });
  }

  return NextResponse.json(
    { message: 'Thank you. Your enquiry has been received and we will be in touch.' },
    { status: 200 },
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: 'Method not allowed.' }, { status: 405 });
}
