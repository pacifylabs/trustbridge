import { expect, test } from '@playwright/test';

/**
 * Compliance rules, asserted against the rendered site.
 *
 * These are the rules that make this a regulated-services site rather than an
 * ordinary marketing one, so they are tested as behaviour rather than trusted
 * to code review.
 */

const PUBLIC_PAGES = [
  '/',
  '/about',
  '/services',
  '/services/spouse-and-partner-visas',
  '/services/business-immigration',
  '/team',
  '/resources',
  '/contact',
  '/book',
  '/legal/regulatory-information',
];

/** Phrases that would state or imply a guaranteed outcome. */
const OUTCOME_CLAIMS = [
  /guaranteed (?:approval|success|visa|outcome|result)/i,
  /we guarantee/i,
  /100%\s*(?:success|approval)/i,
  /\d+%\s*success rate/i,
  /success rate/i,
  /approval rate/i,
  /assured (?:approval|outcome)/i,
];

/** Regulatory claims that must not appear before the client supplies wording. */
const REGULATORY_CLAIMS = [
  /\bOISC\b/i,
  /Office of the Immigration Services Commissioner/i,
  /regulated by/i,
  /authorised and regulated/i,
  /\bSRA\b/i,
  /Law Society/i,
  /Level\s*[123]\s*adviser/i,
];

for (const path of PUBLIC_PAGES) {
  test(`${path} makes no guaranteed-outcome claim`, async ({ page }) => {
    await page.goto(path);
    const text = (await page.locator('body').innerText()) ?? '';

    for (const pattern of OUTCOME_CLAIMS) {
      expect(text, `${path} matched ${pattern}`).not.toMatch(pattern);
    }
  });

  test(`${path} makes no regulatory claim`, async ({ page }) => {
    await page.goto(path);
    const text = (await page.locator('body').innerText()) ?? '';

    for (const pattern of REGULATORY_CLAIMS) {
      expect(text, `${path} matched ${pattern}`).not.toMatch(pattern);
    }
  });
}

test('the word "guarantee" appears only in the disclaimer that denies one', async ({ page }) => {
  await page.goto('/services/spouse-and-partner-visas');

  const disclaimer = page.getByTestId('outcome-disclaimer');
  await expect(disclaimer).toBeVisible();
  await expect(disclaimer).toContainText(/no adviser can guarantee the result/i);

  // A page may carry the disclaimer more than once, so every instance is
  // removed before checking what is left.
  const outsideDisclaimer = await page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    for (const block of Array.from(
      clone.querySelectorAll('[data-testid="outcome-disclaimer"]'),
    )) {
      block.remove();
    }
    document.body.append(clone);
    const text = clone.innerText;
    clone.remove();
    return text;
  });

  expect(outsideDisclaimer).not.toMatch(/guarantee/i);
});

test('every service page carries the shared outcome disclaimer', async ({ page }) => {
  const slugs = [
    'spouse-and-partner-visas',
    'visitor-visas',
    'skilled-worker-visas',
    'health-and-care-worker-visas',
    'settlement-indefinite-leave-to-remain',
    'british-citizenship',
    'eu-settlement-scheme',
    'business-immigration',
  ];

  for (const slug of slugs) {
    await page.goto(`/services/${slug}`);
    await expect(page.getByTestId('outcome-disclaimer'), slug).toBeVisible();
  }
});

test('the footer carries no regulatory claim and no placeholder', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');

  // The placeholder region was removed, so the footer must simply say nothing
  // about regulatory status rather than say something provisional.
  await expect(page.getByTestId('regulatory-placeholder')).toHaveCount(0);
  await expect(footer).not.toContainText(/awaiting/i);
  await expect(footer).not.toContainText(/regulated by|authorised/i);
});

test('every legal route publishes without placeholder furniture', async ({ page }) => {
  const slugs = [
    'privacy-policy',
    'cookie-policy',
    'terms-and-conditions',
    'complaints-procedure',
    'regulatory-information',
    'accessibility',
  ];

  for (const slug of slugs) {
    const response = await page.goto(`/legal/${slug}`);
    expect(response?.status(), slug).toBe(200);

    await expect(page.getByTestId('pending-wording-notice'), slug).toHaveCount(0);
    await expect(page.locator('main'), slug).not.toContainText(/before launch/i);
  }
});

test('the team page shows an honest empty state rather than invented advisers', async ({ page }) => {
  await page.goto('/team');

  await expect(page.getByTestId('team-empty-state')).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/Sample Adviser/i);
});

test('no page carries a launch placeholder', async ({ page }) => {
  for (const path of ['/', '/about', '/services', '/contact', '/book', '/team']) {
    await page.goto(path);
    const text = await page.locator('body').innerText();

    expect(text, `${path} awaiting`).not.toMatch(/awaiting (client|wording)/i);
    expect(text, `${path} before launch`).not.toMatch(/before launch/i);
    expect(text, `${path} TBC`).not.toMatch(/TBC/);
  }
});

test('no third-party requests are made', async ({ page }) => {
  const external: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
      external.push(request.url());
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(external).toStrictEqual([]);
});
