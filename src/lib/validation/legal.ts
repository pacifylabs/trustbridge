import { z } from 'zod';
import { LEGAL_PAGES } from '@/content/legal';

/** The fixed set of legal pages. Editors change their content; nobody adds or removes a page here. */
export const LEGAL_PAGE_SLUGS: readonly string[] = LEGAL_PAGES.map((page) => page.slug);

export const legalLogoSchema = z.object({
  src: z.string().min(1, 'Upload an image or remove this field.'),
  alt: z.string().trim().min(1, 'Please describe the image for screen readers.').max(160),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const legalSectionSchema = z.object({
  heading: z.string().trim().min(2, 'Give this section a heading.').max(160),
  body: z.string().trim().min(1, 'Write something for this section, or leave the pending notice in place.'),
});

export const legalPageInputSchema = z.object({
  title: z.string().trim().min(2, 'Please enter a title.').max(160),
  summary: z.string().trim().min(2, 'Please write a short summary.').max(300),
  sections: z.array(legalSectionSchema).min(1, 'Add at least one section.'),
  logos: z.array(legalLogoSchema).max(4).default([]),
});

export type LegalPageInput = z.infer<typeof legalPageInputSchema>;
export type LegalPageFieldErrors = Partial<Record<string, string>>;

export function collectLegalPageFieldErrors(error: z.ZodError): LegalPageFieldErrors {
  const errors: LegalPageFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in errors)) errors[path] = issue.message;
  }
  return errors;
}
