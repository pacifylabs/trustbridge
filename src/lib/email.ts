import { Resend } from 'resend';
import { env } from './env';
import type { EnquiryData } from './validation/enquiry';

/**
 * Enquiry email delivery.
 *
 * There is no database: this is the only place a submitted enquiry goes.
 * If it fails, the visitor must be told plainly rather than shown a false
 * confirmation, which is why the caller checks the return value rather than
 * treating "sent" as the default outcome.
 */

const FIELD_LABELS: Record<Exclude<keyof EnquiryData, 'website' | 'recaptchaToken'>, string> = {
  fullName: 'Full name',
  email: 'Email address',
  telephone: 'Telephone',
  countryOfResidence: 'Country of residence',
  nationality: 'Nationality',
  enquiryType: 'Type of enquiry',
  description: 'Description',
  contactPreference: 'Preferred method of contact',
  consent: 'Consent given',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildText(data: EnquiryData): string {
  return (Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[])
    .map((field) => `${FIELD_LABELS[field]}: ${field === 'consent' ? 'Yes' : data[field]}`)
    .join('\n');
}

function buildHtml(data: EnquiryData): string {
  const rows = (Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[])
    .map((field) => {
      const value = field === 'consent' ? 'Yes' : String(data[field]);
      return `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${FIELD_LABELS[field]}</td><td style="padding:4px 0;">${escapeHtml(value).replace(/\n/g, '<br />')}</td></tr>`;
    })
    .join('');

  return `<table cellpadding="0" cellspacing="0">${rows}</table>`;
}

export interface SendEnquiryResult {
  readonly ok: boolean;
  readonly error?: string;
}

export async function sendEnquiryEmail(data: EnquiryData): Promise<SendEnquiryResult> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, error: 'Email delivery is not configured (missing RESEND_API_KEY).' };
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `TrustBridge website <${env.ENQUIRY_FROM_EMAIL}>`,
    to: env.ENQUIRY_INBOX,
    replyTo: data.email,
    subject: `New enquiry: ${data.enquiryType} — ${data.fullName}`,
    text: buildText(data),
    html: buildHtml(data),
  });

  if (error) {
    // Never log the payload itself: it carries the visitor's personal data.
    console.error('Resend enquiry email failed:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
