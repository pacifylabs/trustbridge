import { z } from 'zod';

/**
 * Contact details schema.
 *
 * `phoneHref` (the `tel:` link target) is derived from `phone` on write
 * rather than entered separately — one fewer field for an editor to keep in
 * sync, and UK numbers are unambiguous to convert: a leading 0 becomes +44,
 * anything already starting with + is left alone.
 */
export const contactInputSchema = z.object({
  email: z.email('Enter a valid email address.'),
  phone: z.string().trim().min(3, 'Enter a phone number.').max(40),
  address: z.string().trim().max(500).optional(),
  hours: z.string().trim().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
export type ContactFieldErrors = Partial<Record<string, string>>;

export function collectContactFieldErrors(error: z.ZodError): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in errors)) errors[path] = issue.message;
  }
  return errors;
}

/** Converts a UK-style display number into a `tel:` href. */
export function phoneToHref(phone: string): string {
  const digitsAndPlus = phone.replace(/[^\d+]/g, '');
  if (digitsAndPlus.startsWith('+')) return digitsAndPlus;
  if (digitsAndPlus.startsWith('0')) return `+44${digitsAndPlus.slice(1)}`;
  return digitsAndPlus;
}

/** Splits the address textarea into lines, one per line, matching other CMS list fields. */
export function splitAddressLines(address: string | undefined): readonly string[] {
  if (!address) return [];
  return address
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
