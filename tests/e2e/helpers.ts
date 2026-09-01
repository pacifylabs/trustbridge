import { expect, type Page } from '@playwright/test';

/**
 * Sets the colour theme through the floating toggle.
 *
 * The control is fixed to the viewport and present at every breakpoint, so
 * unlike the segmented control it replaced there is no mobile menu to open
 * first. It is a binary switch, so reaching a given theme means pressing it
 * only when the page is not already in that state.
 */
export async function selectTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  const toggle = page.locator('[data-theme-toggle]');
  await expect(toggle).toBeVisible();

  if ((await toggle.getAttribute('data-theme-state')) !== theme) {
    await toggle.click();
  }

  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}
