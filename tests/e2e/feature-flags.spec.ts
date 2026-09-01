import { expect, test } from '@playwright/test';

/**
 * Feature gating and the launch gate, as actually served.
 *
 * The unit tests cover the flag logic; these confirm the running application
 * honours it, which is what the compliance rules are really about.
 */

test('Complex Matters returns 404 while the flag is off', async ({ page }) => {
  const response = await page.goto('/services/complex-immigration-matters');
  expect(response?.status()).toBe(404);
});

test('Complex Matters is absent from the services index', async ({ page }) => {
  await page.goto('/services');
  await expect(page.getByRole('link', { name: /complex matters/i })).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Complex immigration matters');
});

test('Complex Matters is absent from the navigation and footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).not.toContainText(/complex/i);
  await expect(page.locator('footer')).not.toContainText(/complex/i);
});

test('Complex Matters is absent from the sitemap', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  const body = (await response?.text()) ?? '';

  expect(body).not.toContain('complex-immigration-matters');
  expect(body).toContain('spouse-and-partner-visas');
});

test('Business Immigration stays published with its specifics hidden', async ({ page }) => {
  const response = await page.goto('/services/business-immigration');
  expect(response?.status()).toBe(200);

  // The general capability overview is published.
  await expect(page.getByRole('heading', { name: 'Sponsorship duties in practice' })).toBeVisible();

  // The route-specific sections are gated.
  await expect(page.getByRole('heading', { name: 'Sponsor licence applications' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Business and investment routes' })).toHaveCount(0);
});

test('all eight published services resolve', async ({ page }) => {
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
    const response = await page.goto(`/services/${slug}`);
    expect(response?.status(), slug).toBe(200);
  }
});

test('the Coming Soon page carries the contact lines and nothing more', async ({ page }) => {
  await page.goto('/coming-soon');

  await expect(page.getByRole('link', { name: /info@trustbridgeimmigration\.co\.uk/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /07417 487423/ })).toBeVisible();

  // No service list, and no regulatory claim.
  await expect(page.locator('body')).not.toContainText(/OISC/i);
  await expect(page.locator('body')).not.toContainText(/regulated by/i);
  await expect(page.locator('body')).not.toContainText(/guarantee/i);
});
