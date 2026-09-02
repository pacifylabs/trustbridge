import { expect, test } from '@playwright/test';

/** The top navigation: what it offers and what it deliberately does not. */

test('Our team is held back from the navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('header')).not.toContainText('Our team');
  // The page itself still resolves, so restoring the link is a one-line change.
  expect((await page.goto('/team'))?.status()).toBe(200);
});

test('the telephone number is reachable from the bar', async ({ page }, testInfo) => {
  await page.goto('/');
  const width = testInfo.project.use.viewport?.width ?? 0;

  const call = page.locator('header a[href^="tel:"]').first();
  // The href is the international form; the visible text is the local one.
  await expect(call).toHaveAttribute('href', 'tel:+447417487423');
  await expect(call).toContainText('07417 487423');

  // Shown beside the booking button from xl up, where there is room for it.
  if (width >= 1280) {
    await expect(call).toBeVisible();
  }
});

test('exactly one theme control is visible at any width', async ({ page }) => {
  await page.goto('/');

  // One in the bar for small screens, one pinned to the right edge for large.
  await expect(page.locator('[data-theme-toggle]')).toHaveCount(2);
  await expect(page.locator('[data-theme-toggle]:visible')).toHaveCount(1);
});

test('each service card links to its own page', async ({ page }) => {
  await page.goto('/services');
  await page.waitForLoadState('networkidle');

  const links = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="service-grid"] > li')].map(
      (li) => li.querySelector<HTMLAnchorElement>('a[href^="/services/"]')?.getAttribute('href') ?? null,
    ),
  );

  expect(links.length).toBeGreaterThan(1);
  expect(links.every((href) => href !== null)).toBe(true);
  expect(new Set(links).size, 'every card points somewhere different').toBe(links.length);

  for (const href of links) {
    expect((await page.goto(href!))?.status(), href!).toBe(200);
  }
});

test('the whole card is clickable, not just the heading', async ({ page }) => {
  await page.goto('/services');
  await page.waitForLoadState('networkidle');

  // elementFromPoint only reports what is inside the viewport, so the card has
  // to be scrolled into view before its centre can be probed. Without this the
  // check silently passes or fails depending on how tall the viewport is.
  await page.locator('[data-testid="service-grid"] > li').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);

  // The heading link stretches an overlay across the card. A positioned
  // descendant, such as the container the photograph fills, would otherwise
  // paint over that overlay and leave the image area unclickable.
  const covers = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="service-grid"] > li');
    const link = card?.querySelector('a[href^="/services/"]');
    if (!card || !link) return { ok: false, reason: 'card or link missing' };

    const rect = card.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      return { ok: false, reason: 'card outside the viewport' };
    }

    // Probe the middle of the image, which is the part most at risk.
    const points = [
      { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.2 },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.5 },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.8 },
    ].filter((point) => point.y > 0 && point.y < window.innerHeight);

    const misses = points.filter(
      (point) => document.elementFromPoint(point.x, point.y)?.closest('a') !== link,
    );

    return { ok: misses.length === 0, reason: `${misses.length} of ${points.length} points missed` };
  });

  expect(covers.ok, covers.reason).toBe(true);
});
