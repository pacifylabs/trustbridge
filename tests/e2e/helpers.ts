import { expect, type Page } from '@playwright/test';

/**
 * Sets the colour theme through the floating toggle.
 *
 * The control lives in the navigation bar and is present at every breakpoint,
 * so there is no mobile menu to open first. It is a binary switch, so reaching
 * a given theme means pressing it only when the page is not already in that
 * state.
 */
export async function selectTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  // Two controls are rendered, one for the bar and one for the mobile row.
  // Exactly one is visible at any width, and that is the one to drive.
  const toggle = page.locator('[data-theme-toggle]:visible');
  await expect(toggle).toBeVisible();

  if ((await toggle.getAttribute('data-theme-state')) !== theme) {
    await toggle.click();
  }

  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}
