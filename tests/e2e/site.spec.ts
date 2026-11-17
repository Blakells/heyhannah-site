import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

const EMAIL = 'baileyhannah995@gmail.com';

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test('has a title, a description, a canonical URL and one h1', async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(/Hannah Bailey/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://heyhannah.xyz${path}`);
      await expect(page.locator('h1')).toHaveCount(1);
    });

    test('has no accessibility violations', async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const violations = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(violations).toEqual([]);
    });

    test('does not scroll sideways on a 320px screen', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('offers a skip link as the first keyboard stop', async ({ page }) => {
      await page.goto(path);
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveText('Skip to content');
    });

    test('uses only her email address, and has no form or telephone link', async ({ page }) => {
      await page.goto(path);
      const hrefs = await page.locator('a[href^="mailto:"]').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(new URL(href).pathname).toBe(EMAIL);
      }
      await expect(page.locator('form')).toHaveCount(0);
      await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    });

    test('loads nothing from any other site', async ({ page }) => {
      const outside: string[] = [];
      page.on('request', (request) => {
        if (new URL(request.url()).host !== '127.0.0.1:4321') outside.push(request.url());
      });
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(outside).toEqual([]);
    });
  });
}
