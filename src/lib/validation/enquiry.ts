import { z } from 'zod';

/**
 * Enquiry form schema (PRD §6.1).
 *
 * One schema, used by the browser and by the route handler. Client-side
 * validation is a convenience; the server revalidates because anything
 * arriving over the network is untrusted.
 */

export const ENQUIRY_TYPES = [
  'Spouse or partner visa',
  'Visitor visa',
  'Skilled Worker visa',
  'Health and Care Worker visa',
  'Settlement or indefinite leave to remain',
  'British citizenship',
  'EU Settlement Scheme',
  'Business immigration or sponsorship',
  'Something else',
] as const;

export const CONTACT_PREFERENCES = ['Email', 'Telephone', 'Either'] as const;

/** Permissive by design: international numbers vary too much to police tightly. */
const telephonePattern = /^[+()\d\s-]{7,20}$/;

export const enquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(120, 'Please keep your name under 120 characters.'),

  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .pipe(z.email('Please enter a valid email address.'))
    .transform((value) => value.toLowerCase()),

  telephone: z
    .string()
    .trim()
    .min(1, 'Please enter a telephone number.')
    .regex(telephonePattern, 'Please enter a valid telephone number.'),

  countryOfResidence: z
    .string()
    .trim()
    .min(2, 'Please enter your country of residence.')
    .max(80, 'Please keep this under 80 characters.'),

  nationality: z
    .string()
    .trim()
    .min(2, 'Please enter your nationality.')
    .max(80, 'Please keep this under 80 characters.'),

  enquiryType: z.enum(ENQUIRY_TYPES, {
    message: 'Please choose the type of enquiry.',
  }),

  description: z
    .string()
    .trim()
    .min(20, 'Please give us at least a sentence or two about your situation.')
    .max(3000, 'Please keep your description under 3000 characters.'),

  contactPreference: z.enum(CONTACT_PREFERENCES, {
    message: 'Please choose how you would prefer to be contacted.',
  }),

  consent: z.literal(true, {
    message: 'Please confirm you have read how we handle your information.',
  }),

  /**
   * Honeypot. Hidden from sighted users and from assistive technology, so a
   * genuine visitor never fills it in. Any value at all indicates a bot.
   *
   * It is deliberately NOT constrained here. Failing schema validation would
   * return a field error naming this field, which tells the bot exactly what
   * caught it. The route handler checks it separately and acknowledges the
   * submission without acting on it.
   */
  website: z.string().optional().default(''),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryData = z.output<typeof enquirySchema>;

/** Field-level errors keyed by field name, for rendering beside each input. */
export type EnquiryFieldErrors = Partial<Record<keyof EnquiryData, string>>;

/** True when the honeypot was filled, which only a bot would do. */
export function isHoneypotFilled(data: Pick<EnquiryData, 'website'>): boolean {
  return typeof data.website === 'string' && data.website.trim().length > 0;
}

export function collectFieldErrors(error: z.ZodError<EnquiryData>): EnquiryFieldErrors {
  const errors: EnquiryFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof EnquiryData] = issue.message;
    }
  }
  return errors;
}
