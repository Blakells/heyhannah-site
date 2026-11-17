import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('says what she does and where she is, in the first screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('I make complex products easy to understand.');
    const main = page.locator('main');
    await expect(main.getByText('Technical writer · UX writer · Content designer')).toBeVisible();
    await expect(
      main.getByText('Based in Florence, SC · Open to remote, hybrid and on-site roles'),
    ).toBeVisible();
    await expect(main.getByRole('link', { name: 'See my work' })).toHaveAttribute('href', '/work/');
    await expect(main.getByRole('link', { name: 'Download resume' })).toHaveAttribute(
      'href',
      '/hannah-bailey-resume.pdf',
    );
  });

  test('shows the sections in order', async ({ page }) => {
    await page.goto('/');
    const headings = await page.locator('main h2').allTextContents();
    expect(headings).toEqual(['Selected work', 'How I work', 'Beyond the docs', 'Let’s talk.']);
  });

  test('gives the four proof figures', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('main .proof-item');
    await expect(items).toHaveCount(4);
    await expect(items.nth(0)).toContainText('7+');
    await expect(items.nth(0)).toContainText('writing for SaaS products');
    await expect(items.nth(1)).toContainText('100%');
    await expect(items.nth(2)).toContainText('20+');
    await expect(items.nth(3)).toContainText('10');
    await expect(items.nth(3)).toContainText('LinkedIn recommendations from managers and teammates');
  });

  test('links each selected-work card to its work page', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('main .card');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('h3')).toHaveText([
      'Integrating DocuSign with Go Method',
      'Help Centers for Go Method and Growth Method',
      'Microcopy across multiple products',
      'Product video and walkthroughs',
    ]);
    const hrefs = await cards.locator('.card-title a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual([
      '/work/docusign-case-study/',
      '/work/help-centers/',
      '/work/microcopy/',
      '/work/video/',
    ]);
    await expect(page.getByRole('link', { name: /^All work/ })).toHaveAttribute('href', '/work/');
  });

  test('quotes Barbara Green on the recommendation band', async ({ page }) => {
    await page.goto('/');
    const band = page.locator('main section[aria-label="Recommendation"]');
    await expect(band).toContainText(
      'She writes compelling, thoughtful UX copy and has a strong instinct for creating content that truly helps users succeed.',
    );
    await expect(band.locator('figcaption')).toHaveText(
      '— Barbara Green, UX Content Strategy & Operations, managed Hannah directly at ACS Technologies',
    );
  });

  test('shows life beyond the docs, with the Umbra link', async ({ page }) => {
    await page.goto('/');
    const beyond = page.locator('main section[aria-labelledby="beyond-title"]');
    await expect(beyond.locator('h3')).toHaveText(['Motorsports photography', 'Kitten fostering']);
    await expect(beyond.getByRole('link', { name: /See Umbra Photography/ })).toHaveAttribute(
      'href',
      'https://umbra.smugmug.com',
    );
    await expect(beyond).toContainText('I rescue and foster kittens until they’re healthy, social and ready for a home of their own.');
    await expect(beyond.locator('img')).toHaveCount(2);
  });

  test('closes with both ways to get in touch', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('main section[aria-labelledby="cta-title"]');
    await expect(cta.getByRole('heading', { level: 2 })).toHaveText('Let’s talk.');
    await expect(cta.getByRole('link', { name: 'Email me' })).toHaveAttribute(
      'href',
      'mailto:baileyhannah995@gmail.com',
    );
    await expect(cta.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/hannah-bailey-hb2023/',
    );
  });

  test('offers Work, About and Resume in the header', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/work/');
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about/');
    await expect(nav.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume/');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Email me' })).toHaveAttribute(
      'href',
      'mailto:baileyhannah995@gmail.com',
    );
  });
});
