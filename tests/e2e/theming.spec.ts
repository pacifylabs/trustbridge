import { expect, test } from '@playwright/test';
import { selectTheme } from './helpers';

/**
 * Theme switching, end to end.
 *
 * Asserts what the token layer actually produces in a real browser: that the
 * `data-theme` attribute drives the resolved colours, that the choice
 * persists, and that there is no flash of the wrong theme on first paint.
 */

const THEME_KEY = 'tb-theme';

async function resolvedColours(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const root = getComputedStyle(document.documentElement);
    return {
      background: body.backgroundColor,
      colour: body.color,
      accent: root.getPropertyValue('--tb-c-accent').trim(),
      headline: root.getPropertyValue('--tb-c-headline').trim(),
    };
  });
}

test('the toggle is reachable at every breakpoint', async ({ page }, testInfo) => {
  await page.goto('/');

  const toggle = page.locator('[data-theme-toggle]:visible');
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toBeVisible();

  // Pinned to the right edge on large screens, in the bar below that.
  const large = (testInfo.project.use.viewport?.width ?? 0) >= 1280;
  await expect(toggle).toHaveCSS('position', large ? 'fixed' : 'static');
});

test('one press switches the theme and repaints from tokens', async ({ page }) => {
  await page.goto('/');
  await selectTheme(page, 'light');
  const light = await resolvedColours(page);

  await page.locator('[data-theme-toggle]:visible').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const dark = await resolvedColours(page);
  expect(dark.background).not.toBe(light.background);
  expect(dark.colour).not.toBe(light.colour);
  expect(dark.accent).not.toBe(light.accent);
});

test('the toggle announces the action it will take', async ({ page }) => {
  await page.goto('/');
  await selectTheme(page, 'light');

  const toggle = page.locator('[data-theme-toggle]:visible');
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to light mode');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

test('pressing twice returns to where it started', async ({ page }) => {
  await page.goto('/');
  await selectTheme(page, 'light');

  const toggle = page.locator('[data-theme-toggle]:visible');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('runs the change as a single view transition', async ({ page }) => {
  await page.goto('/');
  await selectTheme(page, 'light');

  const supported = await page.evaluate(() => 'startViewTransition' in document);
  test.skip(!supported, 'This browser has no View Transitions API.');

  // The wipe is driven by custom properties set on the root from the button's
  // own position, so the reveal starts where the control is.
  await page.evaluate(() => {
    const root = document.documentElement;
    (window as unknown as { __origins: string[] }).__origins = [];

    const observer = new MutationObserver(() => {
      const x = root.style.getPropertyValue('--tb-theme-origin-x');
      if (x) (window as unknown as { __origins: string[] }).__origins.push(x);
    });

    observer.observe(root, { attributes: true, attributeFilter: ['style'] });
  });

  await page.locator('[data-theme-toggle]:visible').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const origins = await page.evaluate(
    () => (window as unknown as { __origins: string[] }).__origins,
  );
  expect(origins.length).toBeGreaterThan(0);
});

test('persists the choice across navigation and reload', async ({ page }) => {
  await page.goto('/');
  await selectTheme(page, 'dark');

  await page.goto('/services');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  expect(await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)).toBe('dark');
});

test('applies the stored theme before first paint', async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => localStorage.setItem(key, 'dark'), THEME_KEY);

  await page.goto('/about', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // What actually prevents a flash is where the script sits and how it loads:
  // blocking, inline, and ahead of any rendered content.
  const script = await page.evaluate(() => {
    const inline = Array.from(document.head.querySelectorAll('script')).find((tag) =>
      tag.textContent?.includes('data-theme'),
    );

    if (!inline) return null;

    return {
      inHead: inline.parentElement?.tagName === 'HEAD',
      isInline: !inline.src,
      isBlocking: !inline.defer && !inline.async,
      precedesBody: !!(
        inline.compareDocumentPosition(document.body) & Node.DOCUMENT_POSITION_FOLLOWING
      ),
    };
  });

  expect(script).toStrictEqual({
    inHead: true,
    isInline: true,
    isBlocking: true,
    precedesBody: true,
  });
});

test('follows the operating system when nothing is stored', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('[data-theme-toggle]:visible')).toHaveAttribute('data-theme-state', 'dark');

  await context.close();
});

test('body text meets a readable contrast ratio in both themes', async ({ page }) => {
  await page.goto('/');

  for (const theme of ['light', 'dark'] as const) {
    await selectTheme(page, theme);

    const ratio = await page.evaluate(() => {
      const parse = (value: string): [number, number, number] => {
        const parts = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
        return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
      };
      const luminance = ([r, g, b]: [number, number, number]) => {
        const channel = (c: number) => {
          const v = c / 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };

      const style = getComputedStyle(document.body);
      const fg = luminance(parse(style.color));
      const bg = luminance(parse(style.backgroundColor));
      const [lighter, darker] = fg > bg ? [fg, bg] : [bg, fg];
      return (lighter + 0.05) / (darker + 0.05);
    });

    expect(ratio, `${theme} body contrast`).toBeGreaterThanOrEqual(4.5);
  }
});
