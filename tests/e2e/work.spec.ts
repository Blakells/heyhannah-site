import { expect, test } from '@playwright/test';

const WORK = [
  { slug: 'docusign-case-study', title: 'Integrating DocuSign with Go Method' },
  { slug: 'help-centers', title: 'Help Centers for Go Method and Growth Method' },
  { slug: 'onboarding', title: 'Onboarding & release notes' },
  { slug: 'microcopy', title: 'Microcopy across multiple products' },
  { slug: 'video', title: 'Product video and walkthroughs' },
  { slug: 'marketing-emails', title: 'Marketing emails' },
];

test.describe('work index', () => {
  test('has one h1, the one-line summary and six cards', async ({ page }) => {
    await page.goto('/work/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Work');
    await expect(page.locator('main')).toContainText(
      'Help Centers, in-product copy, onboarding, video and marketing: samples from seven years of writing for SaaS products, most of them live today.',
    );
    const cards = page.locator('main .card');
    await expect(cards).toHaveCount(6);
    await expect(cards.locator('h2')).toHaveText([
      'Integrating DocuSign with Go Method',
      'Help Centers for Go Method and Growth Method',
      'Microcopy across multiple products',
      'Product video and walkthroughs',
      'Onboarding & release notes',
      'Marketing emails',
    ]);
    const hrefs = await cards.locator('.card-title a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual([
      '/work/docusign-case-study/',
      '/work/help-centers/',
      '/work/microcopy/',
      '/work/video/',
      '/work/onboarding/',
      '/work/marketing-emails/',
    ]);
  });
});

test.describe('work page shell', () => {
  for (const [index, entry] of WORK.entries()) {
    test(`${entry.slug} has its label, h1, lede, back and next`, async ({ page }) => {
      await page.goto(`/work/${entry.slug}/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(entry.title);
      await expect(page.locator('main .lede')).not.toBeEmpty();

      const nav = page.locator('main nav[aria-label="Work pages"]');
      await expect(nav.getByRole('link', { name: 'Back to all work' })).toHaveAttribute('href', '/work/');
      const next = WORK[(index + 1) % WORK.length]!;
      await expect(nav.locator('a.work-next')).toHaveAttribute('href', `/work/${next.slug}/`);
      await expect(nav.locator('a.work-next')).toContainText(`Next: ${next.title}`);
    });
  }
});

test.describe('DocuSign case study', () => {
  test('runs the seven case-study sections and links the live guide', async ({ page }) => {
    await page.goto('/work/docusign-case-study/');
    await expect(page.getByText('Case study', { exact: true })).toBeVisible();
    const headings = await page.locator('main .prose h2').allTextContents();
    expect(headings).toEqual([
      'Problem / opportunity',
      'Audience',
      'Goal',
      'Approach / my role',
      'Challenges & decisions',
      'Outcome / impact',
      'What this demonstrates',
    ]);
    await expect(page.getByRole('heading', { level: 2, name: 'Live examples' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'DocuSign integration guide in the Go Method Help Center' }),
    ).toHaveAttribute(
      'href',
      'https://help.acst.com/en/go-method/how-to/integrations/digital-signatures/integrate-with-docusign',
    );
  });
});

test.describe('Help Centers', () => {
  test('gives the ownership line and the three samples with descriptions and links', async ({ page }) => {
    await page.goto('/work/help-centers/');
    await expect(page.locator('main')).toContainText('I owned 100% of Help Center content for Go Method and Growth Method');
    const cards = page.locator('main .sample-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.locator('h3')).toHaveText(['Integrations', 'People', 'Funding & Giving']);
    await expect(cards.nth(0)).toContainText('Simplified complex system integrations');
    const hrefs = await cards.locator('a.sample-link').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual([
      'https://help.acst.com/en/go-method/how-to/integrations',
      'https://help.acst.com/en/go-method/how-to/manage-people/participants/participant-profiles',
      'https://help.acst.com/en/go-method/how-to/giving/allocation-types',
    ]);
  });
});

test.describe('Onboarding and release notes', () => {
  test('lists all eleven help-site links in their three groups', async ({ page }) => {
    await page.goto('/work/onboarding/');
    const headings = await page.locator('main .prose h2').allTextContents();
    expect(headings).toEqual(['Onboarding', 'First-time setup', 'Release notes ("What\'s new")']);
    const links = page.locator('main a[href^="https://help.acst.com/en/"]');
    await expect(links).toHaveCount(11);
    await expect(page.locator('main')).toContainText(
      'Feature documentation produced in an Agile environment, aligned with frequent product releases and evolving system behavior.',
    );
  });
});

test.describe('UX microcopy', () => {
  test('shows five captioned screenshots that each open full size', async ({ page }) => {
    await page.goto('/work/microcopy/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Microcopy across multiple products');
    await expect(page.locator('main')).toContainText('A few samples of my microcopy across multiple products.');
    const figures = page.locator('main .shot');
    await expect(figures).toHaveCount(5);
    await expect(figures.locator('.shot-label')).toHaveText([
      'New user sign-in',
      'Informative icons for quick tasks',
      'Warning notifications',
      'AI + support chatbot',
      'Financial UI',
    ]);
    await expect(figures.locator('img')).toHaveCount(5);
    const hrefs = await figures.locator('a.shot-link').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs).toHaveLength(5);
    for (const href of hrefs) expect(href).toMatch(/^\/_astro\/.+\.webp$/);
    await expect(figures.first()).toContainText('View full size');
  });
});

test.describe('Product video', () => {
  test('carries her Notion text and both live video links', async ({ page }) => {
    await page.goto('/work/video/');
    await expect(page.locator('main')).toContainText('multimodal learning');
    await expect(page.getByRole('heading', { level: 2, name: 'Live examples' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Method video basics' })).toHaveAttribute(
      'href',
      'https://help.acst.com/en/go-method/video/go-method-basics',
    );
    await expect(page.getByRole('link', { name: 'Realm getting-started videos' })).toHaveAttribute(
      'href',
      'https://help.acst.com/en/realm/video-library/realm-video-library/getting-started--setup',
    );
  });
});

test.describe('Marketing emails', () => {
  test('shows the four PDFs with their previews, the two hubs and Ken Brisco’s quote', async ({ page }) => {
    await page.goto('/work/marketing-emails/');
    const cards = page.locator('main .email-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('h3')).toHaveText(['Welcome', 'Getting started', 'Integrations', 'Best use cases']);
    const pdfs = await cards.locator('a.email-shot').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(pdfs).toEqual([
      '/samples/email-1-welcome.pdf',
      '/samples/email-2-getting-started.pdf',
      '/samples/email-3-integrations.pdf',
      '/samples/email-4-best-use-cases.pdf',
    ]);
    await expect(cards.locator('img')).toHaveCount(4);

    await expect(page.getByRole('link', { name: /Your mission/ })).toHaveAttribute(
      'href',
      'https://help.acst.com/en/go-method/guides/your-mission-trip-management-hub',
    );
    await expect(page.getByRole('link', { name: /Your ministry/ })).toHaveAttribute(
      'href',
      'https://help.acst.com/en/growth-method/guides/your-ministry-growth-hub',
    );

    const quote = page.locator('main section[aria-label="Recommendation"]');
    await expect(quote).toContainText(
      'She knows how to communicate value in a way customers can easily consume without overwhelming them with unnecessary jargon or noise.',
    );
    await expect(quote.locator('figcaption')).toContainText('Ken Brisco, Product Marketing, ACS Technologies');
  });
});
