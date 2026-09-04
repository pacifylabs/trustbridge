import { describe, expect, it } from 'vitest';
import {
  serviceInputSchema,
  collectServiceFieldErrors,
  splitLines,
  splitParagraphs,
  slugify,
} from '@/lib/validation/service';

/**
 * Service schema (Services CMS).
 *
 * The same schema runs client-side in the CMS form and server-side in the
 * route handler. `intro`/`audience`/`includes` and each section's `body`
 * arrive as raw multi-line strings from their textareas and are only split
 * into lists on write (`lib/cms/services.ts`) — this schema just checks that
 * something real was written, matching the adviser biography convention.
 */

const VALID = {
  slug: 'spouse-and-partner-visas',
  title: 'Spouse and partner visas',
  shortTitle: 'Spouse and partner',
  category: 'family-partner',
  summary: 'Advice for couples applying to live together in the UK.',
  icon: 'users',
  intro: 'Partner applications turn on evidence.',
  audience: 'Partners of British citizens\nCouples switching into the partner route',
  includes: 'Assessment of which partner route fits your circumstances',
  sections: [{ heading: 'The financial requirement', body: 'Most partner applications require a minimum income.' }],
  faqs: [],
  order: 1,
  status: 'published',
};

describe('service schema', () => {
  it('accepts a complete, valid service', () => {
    expect(serviceInputSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects a page address with uppercase or spaces', () => {
    expect(serviceInputSchema.safeParse({ ...VALID, slug: 'Not A Slug' }).success).toBe(false);
  });

  it('rejects a category outside the published list', () => {
    expect(serviceInputSchema.safeParse({ ...VALID, category: 'made-up-category' }).success).toBe(false);
  });

  it('rejects an icon outside the supported set', () => {
    expect(serviceInputSchema.safeParse({ ...VALID, icon: 'sparkles' }).success).toBe(false);
  });

  it('requires at least one section', () => {
    expect(serviceInputSchema.safeParse({ ...VALID, sections: [] }).success).toBe(false);
  });

  it('rejects a section with no heading', () => {
    const result = serviceInputSchema.safeParse({
      ...VALID,
      sections: [{ heading: '', body: 'Some content here.' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts an optional feature restriction on the page and on a section', () => {
    const result = serviceInputSchema.safeParse({
      ...VALID,
      requiresFeature: 'complexMatters',
      sections: [{ ...VALID.sections[0], requiresFeature: 'businessImmigration' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unsupported feature restriction', () => {
    expect(serviceInputSchema.safeParse({ ...VALID, requiresFeature: 'notAFlag' }).success).toBe(false);
  });

  it('coerces the position field from a string, as form inputs submit', () => {
    const result = serviceInputSchema.safeParse({ ...VALID, order: '3' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.order).toBe(3);
  });

  it('rejects a position of zero', () => {
    expect(serviceInputSchema.safeParse({ ...VALID, order: 0 }).success).toBe(false);
  });

  it('reports one error per field', () => {
    const result = serviceInputSchema.safeParse({ ...VALID, slug: '', title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = collectServiceFieldErrors(result.error);
      expect(errors.slug).toBeTruthy();
      expect(errors.title).toBeTruthy();
    }
  });

  it('reports errors nested inside a section by index', () => {
    const result = serviceInputSchema.safeParse({
      ...VALID,
      sections: [{ heading: '', body: '' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = collectServiceFieldErrors(result.error);
      expect(errors['sections.0.heading']).toBeTruthy();
      expect(errors['sections.0.body']).toBeTruthy();
    }
  });
});

describe('splitParagraphs', () => {
  it('splits on blank lines and trims each paragraph', () => {
    expect(splitParagraphs('First paragraph.\n\n  Second paragraph.  ')).toStrictEqual([
      'First paragraph.',
      'Second paragraph.',
    ]);
  });

  it('drops empty paragraphs', () => {
    expect(splitParagraphs('One.\n\n\n\nTwo.')).toStrictEqual(['One.', 'Two.']);
  });
});

describe('splitLines', () => {
  it('splits on single line breaks and trims each line', () => {
    expect(splitLines('First item\n  Second item  \nThird item')).toStrictEqual([
      'First item',
      'Second item',
      'Third item',
    ]);
  });

  it('drops blank lines', () => {
    expect(splitLines('One\n\nTwo\n')).toStrictEqual(['One', 'Two']);
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Spouse and Partner Visas')).toBe('spouse-and-partner-visas');
  });

  it('strips punctuation', () => {
    expect(slugify("Settlement & ILR: What's Next?")).toBe('settlement-ilr-what-s-next');
  });
});
