import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('404 page', () => {
  test('answers a missing page with 404, one h1 and links back to Home and Work', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found · Hannah Bailey/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page drifted off.');
    await expect(page.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '/work/');
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/this-page-does-not-exist/');
    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(violations).toEqual([]);
  });

  test('does not scroll sideways on a 320px screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/this-page-does-not-exist/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
