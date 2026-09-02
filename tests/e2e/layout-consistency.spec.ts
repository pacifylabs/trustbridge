import { expect, test } from '@playwright/test';

/**
 * Container consistency.
 *
 * These exist because the same defect kept coming back in review: a media
 * column and the text column beside it resolving to different heights, or
 * images in one card row rendering at different sizes. Both are the kind of
 * thing that looks fine in one screenshot and wrong at the next breakpoint,
 * so they are measured rather than eyeballed.
 */

test('the service hero image and its copy finish level', async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  test.skip(width < 1024, 'The columns stack below lg, where equal height is meaningless.');

  for (const slug of ['visitor-visas', 'spouse-and-partner-visas', 'business-immigration']) {
    await page.goto(`/services/${slug}`);
    await page.waitForLoadState('networkidle');

    const heights = await page.evaluate(() => {
      const copy = document.querySelector('main h1')?.closest('[class*="col-span-6"]');
      const grid = copy?.parentElement;
      if (!grid) return null;

      return [...grid.children].map((child) =>
        Math.round(child.getBoundingClientRect().height),
      );
    });

    expect(heights, slug).not.toBeNull();
    expect(heights!.length, slug).toBe(2);
    expect(Math.abs(heights![0]! - heights![1]!), `${slug} column heights`).toBeLessThanOrEqual(1);
  }
});

test('every service card image is the same height, featured included', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const media = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="service-grid"] > li')].map((li) => {
      const image = li.querySelector('img');
      return image ? Math.round(image.getBoundingClientRect().height) : 0;
    }),
  );

  expect(media.length).toBeGreaterThan(1);
  // The featured card is twice as wide; a shared aspect ratio would have made
  // its image proportionally taller and broken the row.
  expect(new Set(media).size, `heights were ${media.join(', ')}`).toBe(1);
});

test('cards sharing a row share a height', async ({ page }) => {
  await page.goto('/services');
  await page.waitForLoadState('networkidle');

  const rows = await page.evaluate(() => {
    const grouped = new Map<number, number[]>();

    for (const li of document.querySelectorAll('[data-testid="service-grid"] > li')) {
      const rect = li.getBoundingClientRect();
      const top = Math.round(rect.top);
      grouped.set(top, [...(grouped.get(top) ?? []), Math.round(rect.height)]);
    }

    return [...grouped.values()];
  });

  for (const heights of rows) {
    expect(new Set(heights).size, `row heights ${heights.join(', ')}`).toBe(1);
  }
});

test('testimonial cards in view share a height', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const heights = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="testimonial-track"] > li')].map((li) =>
      Math.round(li.getBoundingClientRect().height),
    ),
  );

  expect(heights.length).toBeGreaterThan(1);
  expect(new Set(heights).size, `heights were ${heights.join(', ')}`).toBe(1);
});
