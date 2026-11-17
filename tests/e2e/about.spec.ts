import { expect, test } from '@playwright/test';

test.describe('about page', () => {
  test('has one h1 and her four sections in order', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About Hannah');
    const headings = await page.locator('main h2').allTextContents();
    expect(headings).toEqual(['My story', 'How I work', 'Kind words', 'Beyond the docs']);
    await expect(page.locator('main')).toContainText(
      'I design clear, user-centered content for SaaS products',
    );
  });

  test('tells her story with the five roles in order', async ({ page }) => {
    await page.goto('/about/');
    const story = page.locator('section[aria-labelledby="story-title"]');
    await expect(story).toContainText('I started at ACS Technologies as a technical writing intern');
    await expect(story).toContainText('more than 30 years of the foundation’s records');

    const roles = story.locator('.timeline li');
    await expect(roles).toHaveCount(5);
    await expect(roles.locator('h3')).toHaveText([
      'Technical Writing Intern',
      'Technical Writer',
      'Junior UX Writer',
      'Senior UX Writer',
      'Documentation and Information Management Specialist',
    ]);
    const dates = await roles.locator('.tl-dates').allTextContents();
    expect(dates).toEqual([
      'Jul 2018 – Jan 2019',
      'Jan 2019 – Aug 2021',
      'Aug 2021 – Dec 2023',
      'Dec 2023 – Dec 2025',
      'Jan 2026 – Present',
    ]);
    await expect(roles.nth(4)).toContainText('Drs. Bruce and Lee Foundation');
  });

  test('explains how she works, what she creates and where she stands on AI', async ({ page }) => {
    await page.goto('/about/');
    const how = page.locator('section[aria-labelledby="how-title"]');
    await expect(how).toContainText('I like to get involved in the project or problem');
    await expect(how).toContainText(/I haven.t owned a fully AI-driven product yet/);
    await expect(how.locator('.creates li')).toHaveText([
      'Help content',
      'User workflows',
      'Error states and responses',
      'Onboarding',
      'Product microcopy',
      'UX and video strategy',
      'Conversation design thinking',
    ]);
    await expect(how.getByRole('heading', { level: 3, name: 'On AI' })).toBeVisible();
  });

  test('shows the five kind words and links all ten recommendations', async ({ page }) => {
    await page.goto('/about/');
    const kind = page.locator('section[aria-labelledby="kind-title"]');
    const cards = kind.locator('.kind-card');
    await expect(cards).toHaveCount(5);
    const captions = await cards.locator('figcaption').allTextContents();
    expect(captions).toEqual([
      '— Barbara Green, UX Content Strategy & Operations, her manager',
      '— Dale Ahn, UX Design Manager',
      '— Dani Robertshaw, Technical Writer',
      '— Patrice Bethea, Product Owner',
      '— Amy Lauren Scott, Professional & Technical Writer',
    ]);
    await expect(cards.nth(0)).toContainText('Hannah supported multiple products and consistently got up to speed quickly');
    await expect(cards.nth(3)).toContainText('she translated complex ideas into clear, effective messaging for clients');
    await expect(kind.getByRole('link', { name: 'Read all 10 on LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/hannah-bailey-hb2023/details/recommendations/',
    );
  });

  test('closes with life beyond the docs: photography, fostering and her Notion line', async ({ page }) => {
    await page.goto('/about/');
    const beyond = page.locator('section[aria-labelledby="beyond-title"]');
    await expect(beyond.locator('.panel')).toHaveCount(2);
    await expect(beyond.getByRole('heading', { level: 3 })).toHaveText([
      'Motorsports photography',
      'Kitten fostering',
    ]);
    await expect(beyond.getByRole('link', { name: 'See Umbra Photography' })).toHaveAttribute(
      'href',
      'https://umbra.smugmug.com',
    );
    await expect(beyond.locator('.kitten-gallery img')).toHaveCount(2);
    await expect(beyond).toContainText(
      'Whether I’m absorbed in a good book, traveling, dilly-dallying in Animal Crossing, or spending time at the beach',
    );
  });
});
