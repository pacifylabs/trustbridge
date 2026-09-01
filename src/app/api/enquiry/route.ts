import { NextResponse } from 'next/server';
import { collectFieldErrors, enquirySchema, isHoneypotFilled } from '@/lib/validation/enquiry';

/**
 * Enquiry endpoint.
 *
 * PHASE 1 SCOPE. This handler validates the submission and acknowledges it.
 * It does NOT persist anything and does NOT send email. Encrypted storage in
 * Postgres, delivery to the shared mailbox, CAPTCHA verification and rate
 * limiting are Phase 4 (PRD §6.1).
 *
 * The acknowledgement wording reflects that honestly: it tells the visitor
 * their details have been received rather than claiming a reply is on its way,
 * because until Phase 4 lands nothing actually reaches the practice.
 */

const NOT_YET_PERSISTED_NOTICE =
  'Your details have been checked and received. Enquiry delivery is being finalised, so please also email or call us using the details on this page.';

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
    return NextResponse.json({ message: NOT_YET_PERSISTED_NOTICE }, { status: 200 });
  }

  // Phase 4 wires encryption, the TypeORM write and the transactional email
  // here. Nothing is stored in the meantime, so nothing is logged either: the
  // payload contains personal data and must not reach application logs.

  return NextResponse.json(
    { message: NOT_YET_PERSISTED_NOTICE, persisted: false },
    { status: 200 },
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: 'Method not allowed.' }, { status: 405 });
}
