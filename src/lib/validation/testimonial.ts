import { z } from 'zod';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Words that turn a testimonial into an outcome claim. A quote saying an
 * application succeeded breaches the same rule the site's own copy follows
 * (README rule 1) just as surely as if TrustBridge had written it directly —
 * checked here rather than left to review, since this is the one piece of
 * content most likely to be added by someone not thinking about that rule.
 */
const OUTCOME_PATTERN = /granted|approved|succeed|success|guarantee|got me (a|my|the)|won my|visa was|application was accepted/i;

/**
 * A full "Firstname Lastname" attribution risks publishing a real client's
 * identity alongside their immigration matter — attribution should read as
 * "Spouse visa client, Manchester", not a name (README rule 6's reasoning
 * applied to testimonials rather than adviser placeholders).
 */
const FULL_NAME_PATTERN = /^[A-Z][a-z]+ [A-Z][a-z]+$/;

export const testimonialInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'The slug must be at least 3 characters.')
    .max(100, 'Keep the slug under 100 characters.')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens only.'),
  quote: z
    .string()
    .trim()
    .min(10, 'Please write the testimonial.')
    .max(600, 'Keep the quote under 600 characters.')
    .refine(
      (value) => !OUTCOME_PATTERN.test(value),
      'This reads as a claim about the outcome of an application — no testimonial may imply a visa or application succeeded.',
    ),
  attribution: z
    .string()
    .trim()
    .min(2, 'Please describe who this is from, e.g. "Spouse visa client".')
    .max(80)
    .refine(
      (value) => !FULL_NAME_PATTERN.test(value),
      'Use a role, not a full name, e.g. "Spouse visa client" rather than the client\'s actual name.',
    ),
  location: z.string().trim().min(2, 'Please enter a location.').max(80),
  status: z.enum(['draft', 'published']),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
export type TestimonialFieldErrors = Partial<Record<string, string>>;

export function collectTestimonialFieldErrors(error: z.ZodError): TestimonialFieldErrors {
  const errors: TestimonialFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in errors)) errors[path] = issue.message;
  }
  return errors;
}
