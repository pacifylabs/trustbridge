import { expect, test } from '@playwright/test';

/**
 * Layout at the four breakpoints named in the brief.
 *
 * These assertions are the ones jsdom cannot make honestly: real overflow, real
 * computed card geometry, and the navigation actually collapsing.
 */

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/services', name: 'Services index' },
  { path: '/services/spouse-and-partner-visas', name: 'Service detail' },
  { path: '/team', name: 'Team' },
  { path: '/resources', name: 'Resources' },
  { path: '/contact', name: 'Contact' },
  { path: '/book', name: 'Book' },
  { path: '/legal/privacy-policy', name: 'Legal' },
];

for (const page of PAGES) {
  test(`${page.name} never scrolls horizontally`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await browserPage.waitForLoadState('networkidle');

    const overflow = await browserPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    // One pixel of tolerance for sub-pixel rounding.
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });

  test(`${page.name} has exactly one level-one heading`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await expect(browserPage.locator('h1')).toHaveCount(1);
  });
}

test('no element spills beyond the viewport width', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const spills = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders: string[] = [];

    for (const element of Array.from(document.body.querySelectorAll('*'))) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      // Decorative blur layers are intentionally oversized and clipped by an
      // ancestor with overflow-hidden, so their unclipped rect is not a spill.
      // The authoritative overflow assertion is the scrollWidth check above.
      if (element.closest('[aria-hidden="true"]')) continue;
      if (rect.right > width + 1 || rect.left < -1) {
        offenders.push(`${element.tagName.toLowerCase()}.${element.className}`.slice(0, 120));
      }
    }
    return offenders;
  });

  expect(spills).toStrictEqual([]);
});

test('navigation collapses below the large breakpoint and expands above it', async ({
  page,
}, testInfo) => {
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: /open menu/i });
  const desktopNav = page.getByRole('navigation', { name: 'Primary' });
  const isNarrow = (testInfo.project.use.viewport?.width ?? 0) < 1024;

  if (isNarrow) {
    await expect(menuButton).toBeVisible();
    await expect(desktopNav).toBeHidden();

    await menuButton.click();
    await expect(page.getByRole('navigation', { name: 'Primary mobile' })).toBeVisible();
  } else {
    await expect(menuButton).toBeHidden();
    await expect(desktopNav).toBeVisible();
  }
});

test('cards in a group share equal height and identical padding', async ({ page }) => {
  await page.goto('/services');
  await page.waitForLoadState('networkidle');

  const geometry = await page.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll('[data-testid="service-grid"] > li'),
    );
    return cards.map((card) => {
      const rect = card.getBoundingClientRect();
      const style = getComputedStyle(card);
      return {
        top: Math.round(rect.top),
        height: Math.round(rect.height),
        padding: `${style.paddingTop}|${style.paddingLeft}`,
        radius: style.borderTopLeftRadius,
      };
    });
  });

  expect(geometry.length).toBeGreaterThan(1);

  // Padding and radius are shared by every card, whatever the row.
  const paddings = new Set(geometry.map((card) => card.padding));
  const radii = new Set(geometry.map((card) => card.radius));
  expect(paddings.size).toBe(1);
  expect(radii.size).toBe(1);

  // Cards sharing a row share a height, which is the equal-height rule.
  const rows = new Map<number, number[]>();
  for (const card of geometry) {
    const row = rows.get(card.top) ?? [];
    row.push(card.height);
    rows.set(card.top, row);
  }

  for (const heights of rows.values()) {
    expect(new Set(heights).size).toBe(1);
  }
});

test('interactive targets meet the minimum touch size', async ({ page }) => {
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');

  const undersized = await page.evaluate(() => {
    const offenders: string[] = [];
    const elements = document.querySelectorAll('main button, main a[href], main select, main input');

    for (const element of Array.from(elements)) {
      if (element.closest('[aria-hidden="true"]')) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      // Inline links inside running text are exempt; they are not tap targets.
      if (element.tagName === 'A' && element.closest('p, address, li, dd')) continue;

      // A checkbox is 16px by convention. The clickable region is its label,
      // so that is what has to meet the minimum.
      const input = element as HTMLInputElement;
      if (input.type === 'checkbox' || input.type === 'radio') {
        const label = element.closest('label') ?? document.querySelector(`label[for="${input.id}"]`);
        const labelHeight = label?.getBoundingClientRect().height ?? 0;
        if (labelHeight < 36) {
          offenders.push(`${input.type} label: ${Math.round(labelHeight)}px`);
        }
        continue;
      }

      if (rect.height < 36) {
        offenders.push(`${element.tagName}: ${Math.round(rect.height)}px`);
      }
    }
    return offenders;
  });

  expect(undersized).toStrictEqual([]);
});

test('the floating toggle never covers an interactive element', async ({ page }) => {
  // A control fixed to the bottom-right corner is the classic way to bury a
  // form's submit button or the last link in a footer, so every page is
  // checked scrolled to the bottom, where the risk is highest.
  for (const path of ['/', '/contact', '/services', '/book', '/resources']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    const occluded = await page.evaluate(() => {
      const toggle = document.querySelector('[data-theme-toggle]')?.getBoundingClientRect();
      if (!toggle) return ['no toggle found'];

      const gap = 6;
      const hits: string[] = [];

      for (const element of document.querySelectorAll('a[href], button, input, select, textarea')) {
        if (element.hasAttribute('data-theme-toggle')) continue;

        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

        const overlaps = !(
          rect.right <= toggle.left - gap ||
          toggle.right + gap <= rect.left ||
          rect.bottom <= toggle.top - gap ||
          toggle.bottom + gap <= rect.top
        );

        if (overlaps) {
          hits.push((element.textContent || element.tagName).trim().slice(0, 40));
        }
      }

      return hits;
    });

    expect(occluded, `${path} at the bottom of the page`).toStrictEqual([]);
  }
});

test('the hero fills the viewport below the header on large screens', async ({
  page,
}, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? 0;
  test.skip(width < 1024, 'The viewport-height hero applies from lg up.');

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const measured = await page.evaluate(() => {
    const hero = document.querySelector('main section');
    const header = document.querySelector('header');
    return {
      heroHeight: hero?.getBoundingClientRect().height ?? 0,
      headerHeight: header?.getBoundingClientRect().height ?? 0,
      viewport: window.innerHeight,
    };
  });

  // A minimum, not a fixed height: the hero may grow past it, never under.
  expect(measured.heroHeight).toBeGreaterThanOrEqual(
    measured.viewport - measured.headerHeight - 1,
  );
});
