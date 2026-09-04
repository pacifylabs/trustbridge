import { z } from 'zod';
import type { ServiceCategoryId, ServiceIcon } from '@/lib/content/types';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Kept in sync with `ServiceCategoryId` in `lib/content/types.ts`. */
export const SERVICE_CATEGORIES = [
  'family-partner',
  'visitor',
  'work',
  'business',
  'settlement',
  'citizenship',
  'eu-settlement-scheme',
  'status-support',
  'complex-matters',
] as const satisfies readonly ServiceCategoryId[];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategoryId, string> = {
  'family-partner': 'Family & partner visas',
  visitor: 'Visitor visas',
  work: 'Work visas',
  business: 'Business immigration',
  settlement: 'Settlement (ILR)',
  citizenship: 'British citizenship',
  'eu-settlement-scheme': 'EU Settlement Scheme',
  'status-support': 'Status & application support',
  'complex-matters': 'Complex immigration matters',
};

/** Kept in sync with `ServiceIcon` in `lib/content/types.ts`. */
export const SERVICE_ICONS = [
  'users',
  'plane',
  'briefcase',
  'building',
  'home',
  'award',
  'globe',
  'file-text',
  'scale',
] as const satisfies readonly ServiceIcon[];

/** Kept in sync with `FeatureFlag` in `lib/flags.ts`. */
export const SERVICE_FEATURE_FLAGS = ['complexMatters', 'businessImmigration'] as const;

export const SERVICE_FEATURE_FLAG_LABELS: Record<(typeof SERVICE_FEATURE_FLAGS)[number], string> = {
  complexMatters: 'Complex Immigration Matters',
  businessImmigration: 'Business Immigration (full detail)',
};

export const serviceImageSchema = z.object({
  src: z.string().min(1, 'Upload a photo or remove this field.'),
  alt: z.string().trim().min(1, 'Please describe the photo for screen readers.').max(160),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const sectionInputSchema = z.object({
  heading: z.string().trim().min(2, 'Give this part of the page a heading.').max(160),
  body: z.string().trim().min(10, 'Write something for this part of the page.'),
  requiresFeature: z.enum(SERVICE_FEATURE_FLAGS).optional(),
});

const faqInputSchema = z.object({
  question: z.string().trim().min(4, 'Write the question.').max(200),
  answer: z.string().trim().min(4, 'Write an answer.').max(1000),
});

/**
 * Service schema (Services CMS).
 *
 * `intro`, `audience` and `includes` come from the form as one item per line
 * (a paragraph, or a single bullet point) and are split into lists on write —
 * see `splitLines`/`splitParagraphs` below, the same convention used for
 * adviser biographies (`lib/validation/adviser.ts`).
 */
export const serviceInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Must be at least 3 characters.')
    .max(100, 'Keep it under 100 characters.')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens only, e.g. spouse-and-partner-visas.'),
  title: z.string().trim().min(3, 'Please enter a page title.').max(160),
  shortTitle: z
    .string()
    .trim()
    .min(2, 'Please enter a short title for cards and menus.')
    .max(60, 'Keep the short title under 60 characters.'),
  category: z.enum(SERVICE_CATEGORIES),
  summary: z
    .string()
    .trim()
    .min(10, 'Please write a short summary.')
    .max(400, 'Keep the summary under 400 characters.'),
  icon: z.enum(SERVICE_ICONS),
  image: serviceImageSchema.optional(),
  intro: z.string().trim().min(10, 'Write at least one opening paragraph.'),
  audience: z.string().trim().min(2, 'List at least one type of client this service is for.'),
  includes: z.string().trim().min(2, 'List at least one thing included with this service.'),
  sections: z.array(sectionInputSchema).min(1, 'Add at least one part of the page.'),
  faqs: z.array(faqInputSchema).default([]),
  order: z.coerce
    .number()
    .int('Enter a whole number.')
    .min(1, 'Position must be 1 or higher.')
    .max(9999),
  requiresFeature: z.enum(SERVICE_FEATURE_FLAGS).optional(),
  status: z.enum(['draft', 'published']),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type ServiceFieldErrors = Partial<Record<string, string>>;

export function collectServiceFieldErrors(error: z.ZodError): ServiceFieldErrors {
  const errors: ServiceFieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in errors)) errors[path] = issue.message;
  }
  return errors;
}

/** Splits on blank lines: one or more paragraphs from a single textarea. */
export function splitParagraphs(text: string): readonly string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Splits on single line breaks: one list item per line. */
export function splitLines(text: string): readonly string[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}
