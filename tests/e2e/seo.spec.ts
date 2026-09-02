import { expect, test } from '@playwright/test';

/**
 * SEO, as actually served.
 *
 * Checks the tags a crawler and a social platform will read, and that every
 * share card resolves. It also holds the compliance line: no review or rating
 * markup, because the testimonials on the site are samples rather than real
 * client feedback.
 */

const PAGES = [
  '/',
  '/about',
  '/services',
  '/services/visitor-visas',
  '/resources',
  '/resources/how-we-handle-your-documents',
  '/contact',
  '/book',
  '/legal/privacy-policy',
];

for (const path of PAGES) {
  test(`${path} carries the tags a crawler needs`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator('title')).not.toBeEmpty();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /.{50,}/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  });

  test(`${path} has a share card that resolves`, async ({ page, request }) => {
    await page.goto(path);

    const src = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(src, `${path} og:image`).toBeTruthy();

    // Next resolves og:image against metadataBase, which is the production
    // origin. The file being checked is the one this build serves, so the
    // path is re-pointed at the server under test.
    const local = new URL(new URL(src!).pathname, page.url()).toString();

    const response = await request.get(local);
    expect(response.status(), local).toBe(200);
    // WebP is not rendered as a share card by several platforms.
    expect(response.headers()['content-type'], local).toMatch(/image\/(jpeg|png)/);
  });
}

test('the practice is described once, as structured data', async ({ page }) => {
  await page.goto('/');

  const blocks = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) =>
      JSON.parse(s.textContent ?? '{}'),
    ),
  );

  const organisation = blocks.find((b) => b['@type'] === 'ProfessionalService');
  expect(organisation).toBeDefined();
  expect(organisation.name).toContain('TrustBridge');
  expect(blocks.some((b) => b['@type'] === 'WebSite')).toBe(true);
});

test('a service page marks up its service, questions and trail', async ({ page }) => {
  await page.goto('/services/visitor-visas');

  const types = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => JSON.parse(s.textContent ?? '{}')['@type'],
    ),
  );

  expect(types).toContain('Service');
  expect(types).toContain('FAQPage');
  expect(types).toContain('BreadcrumbList');
});

test('marked-up questions are the ones actually on the page', async ({ page }) => {
  await page.goto('/services/visitor-visas');

  const marked = await page.evaluate(() => {
    const faq = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent ?? '{}'))
      .find((b) => b['@type'] === 'FAQPage');

    return (faq?.mainEntity ?? []).map((q: { name: string }) => q.name);
  });

  expect(marked.length).toBeGreaterThan(0);

  // Marking up content a visitor cannot see is against Google's guidelines.
  for (const question of marked) {
    await expect(page.getByText(question, { exact: true }).first()).toBeAttached();
  }
});

test('no page claims a rating or publishes review markup', async ({ page }) => {
  for (const path of ['/', '/services/visitor-visas', '/about']) {
    await page.goto(path);
    const html = await page.content();

    // The testimonials are samples, so marking them up would be fabricated
    // review data as well as a breach of Google's policy.
    expect(html, `${path} aggregateRating`).not.toMatch(/aggregateRating/i);
    expect(html, `${path} Review`).not.toMatch(/"@type"\s*:\s*"Review"/);
    expect(html, `${path} award`).not.toMatch(/"award"\s*:/);
  }
});

test('nothing is indexable until launch is confirmed', async ({ page }) => {
  await page.goto('/');

  // The suite runs with SITE_LAUNCHED unset, so the site must say noindex.
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toMatch(/noindex/);
});

test('the sitemap lists only what is published', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  const body = (await response?.text()) ?? '';

  expect(body).toContain('/services/spouse-and-partner-visas');
  expect(body).not.toContain('complex-immigration-matters');
  expect(body).not.toContain('/coming-soon');
});
