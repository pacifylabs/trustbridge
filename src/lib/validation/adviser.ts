import { z } from 'zod';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Adviser schema (Team CMS).
 *
 * `regulatoryLevel` and `registrationNumber` are free text, not validated
 * against any format — deliberately: this is exactly the sensitive
 * regulatory information README rule 6 says must come from the practice,
 * never be invented. The form warns editors about this; the schema only
 * checks that something was typed, not what.
 */
export const adviserInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'The slug must be at least 3 characters.')
    .max(100, 'Keep the slug under 100 characters.')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens only, e.g. jane-doe.'),
  name: z.string().trim().min(2, 'Please enter a name.').max(120),
  professionalTitle: z.string().trim().min(2, 'Please enter a professional title.').max(120),
  regulatoryLevel: z.string().trim().min(1, 'Please enter the confirmed regulatory level.').max(160),
  registrationNumber: z.string().trim().min(1, 'Please enter the confirmed registration number.').max(80),
  biography: z.string().trim().min(10, 'Please write a short biography.'),
  photoUrl: z.string().optional(),
  linkedServiceSlugs: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']),
});

export type AdviserInput = z.infer<typeof adviserInputSchema>;
export type AdviserFieldErrors = Partial<Record<string, string>>;

export function collectAdviserFieldErrors(error: z.ZodError): AdviserFieldErrors {
  const errors: AdviserFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in errors)) errors[path] = issue.message;
  }
  return errors;
}

/** Splits on blank lines, matching how the biography textarea is written. */
export function biographyToParagraphs(biography: string): readonly string[] {
  return biography
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
