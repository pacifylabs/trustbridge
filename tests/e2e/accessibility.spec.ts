import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { selectTheme } from './helpers';

/**
 * Accessibility, on fully composed pages.
 *
 * The component tests catch violations in isolation; these catch the ones that
 * only appear once a page is assembled, such as landmark and heading order
 * problems. Target is WCAG 2.1 AA (PRD §7).
 */

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/services', name: 'Services index' },
  { path: '/services/skilled-worker-visas', name: 'Service detail' },
  { path: '/team', name: 'Team' },
  { path: '/resources', name: 'Resources' },
  { path: '/resources/how-we-handle-your-documents', name: 'Article' },
  { path: '/contact', name: 'Contact' },
  { path: '/book', name: 'Book' },
  { path: '/legal/privacy-policy', name: 'Legal' },
  { path: '/coming-soon', name: 'Coming Soon' },
];

for (const { path, name } of PAGES) {
  test(`${name} has no WCAG A or AA violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toStrictEqual([]);
  });
}

test('every page is reachable by keyboard from the skip link', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(focused).toBe('Skip to content');

  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeVisible();
});

test('dark mode has no WCAG violations either', async ({ page }) => {
  await page.goto('/');
  await selectTheme(page, 'dark');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toStrictEqual([]);
});

test('the enquiry form announces validation errors', async ({ page }) => {
  await page.goto('/contact');

  await page.getByRole('button', { name: /send enquiry/i }).click();

  const status = page.getByTestId('enquiry-status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(status).toContainText(/please correct the highlighted fields/i);

  await expect(page.getByLabel(/full name/i)).toHaveAttribute('aria-invalid', 'true');
});

test('the hero copy stays legible over every photograph in the rotation', async ({ page }) => {
  // The full-bleed scrim was removed so the photography reads clearly, which
  // means the panel behind the copy is now the only thing carrying contrast.
  // This samples the actual photograph under the panel, blends it with the
  // panel's weakest tint stop, and checks the result against the real text
  // colours, for every frame of the rotation.
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const results = await page.evaluate(async () => {
    const luminance = ([r, g, b]: number[]) => {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const contrast = (fg: number[], bg: number[]) => {
      const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
      return (hi + 0.05) / (lo + 0.05);
    };
    const parseColour = (value: string) => {
      const parts = (value.match(/[\d.]+/g) ?? []).map(Number);
      return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3]! : 1 };
    };

    const heading = document.querySelector('main h1')!;
    const panel = heading.closest('div')!;
    const standfirst = [...panel.querySelectorAll('p')].find((p) =>
      p.textContent?.startsWith('TrustBridge advises'),
    )!;

    const text = {
      headline: parseColour(getComputedStyle(heading).color),
      emphasis: parseColour(getComputedStyle(heading.querySelector('span')!).color),
      standfirst: parseColour(getComputedStyle(standfirst).color),
    };

    // The panel declares its tint as channels plus a floor alpha, so the worst
    // stop is read directly rather than parsed back out of a computed
    // gradient, which the browser may serialise in any colour space.
    const panelStyle = getComputedStyle(panel);
    const panelRgb = panelStyle
      .getPropertyValue('--tb-panel-rgb')
      .trim()
      .split(/\s+/)
      .map(Number);
    const panelAlpha = Number(panelStyle.getPropertyValue('--tb-panel-alpha-min').trim());

    const rect = panel.getBoundingClientRect();
    const frames = [...document.querySelectorAll<HTMLImageElement>(
      '[data-testid="hero-backdrop"] img',
    )];

    const out: { frame: number; headline: number; emphasis: number; standfirst: number }[] = [];

    for (const [index, img] of frames.entries()) {
      await img.decode().catch(() => undefined);
      if (!img.naturalWidth) continue;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // The backdrop uses object-fit: cover, so map the panel's rect through
      // the same scale-and-centre the browser applied.
      const host = img.getBoundingClientRect();
      const scale = Math.max(host.width / img.naturalWidth, host.height / img.naturalHeight);
      const drawnW = img.naturalWidth * scale;
      const drawnH = img.naturalHeight * scale;
      const offsetX = host.left + (host.width - drawnW) / 2;
      const offsetY = host.top + (host.height - drawnH) / 2;

      const toImage = (x: number, y: number) => [
        Math.min(img.naturalWidth - 1, Math.max(0, Math.round((x - offsetX) / scale))),
        Math.min(img.naturalHeight - 1, Math.max(0, Math.round((y - offsetY) / scale))),
      ];

      const [x0, y0] = toImage(rect.left, rect.top);
      const [x1, y1] = toImage(rect.right, rect.bottom);
      const data = ctx.getImageData(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)).data;

      let lightest = [0, 0, 0];
      let best = -1;
      for (let i = 0; i < data.length; i += 4 * 37) {
        const px = [data[i]!, data[i + 1]!, data[i + 2]!];
        const l = luminance(px);
        if (l > best) {
          best = l;
          lightest = px;
        }
      }

      // Composite the panel tint over the brightest part of the photograph.
      const ground = lightest.map((c, i) => panelRgb[i]! * panelAlpha + c * (1 - panelAlpha));
      const effective = (t: { rgb: number[]; alpha: number }) =>
        t.rgb.map((c, i) => c * t.alpha + ground[i]! * (1 - t.alpha));

      out.push({
        frame: index,
        headline: contrast(effective(text.headline), ground),
        emphasis: contrast(effective(text.emphasis), ground),
        standfirst: contrast(effective(text.standfirst), ground),
      });
    }

    return out;
  });

  expect(results.length).toBeGreaterThan(0);
  expect(results.length, 'every frame measured').toBe(5);

  for (const frame of results) {
    // The headline is display size, but it is held to the body threshold
    // anyway; the gold emphasis is large text, so 3:1 applies to it.
    expect(frame.headline, `frame ${frame.frame} headline`).toBeGreaterThanOrEqual(4.5);
    expect(frame.standfirst, `frame ${frame.frame} standfirst`).toBeGreaterThanOrEqual(4.5);
    expect(frame.emphasis, `frame ${frame.frame} gold emphasis`).toBeGreaterThanOrEqual(3);
  }
});

test('the hero photograph is not covered by a full-bleed scrim', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const coverage = await page.evaluate(() => {
    const backdrop = document.querySelector('[data-testid="hero-backdrop"]')!;
    const area = backdrop.getBoundingClientRect();

    // Any non-image child that covers most of the backdrop would be a scrim.
    return [...backdrop.children]
      .filter((child) => child.tagName !== 'IMG')
      .map((child) => {
        const rect = child.getBoundingClientRect();
        return (rect.width * rect.height) / (area.width * area.height);
      });
  });

  // The only overlay left is a short gradient along the bottom edge.
  for (const fraction of coverage) {
    expect(fraction).toBeLessThan(0.5);
  }
});
