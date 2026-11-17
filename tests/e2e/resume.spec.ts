import { expect, test } from '@playwright/test';
import { checkResumePdf, pdfText } from '../../scripts/lib/pdf-text.mjs';

const EMAIL = 'baileyhannah995@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/hannah-bailey-hb2023/';

test.describe('resume page', () => {
  test('shows her name, roles, contact line and download link', async ({ page }) => {
    await page.goto('/resume/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hannah Bailey');

    const hero = page.locator('.resume-hero');
    await expect(hero).toContainText('Technical Writer · UX Writer · Content Designer');
    await expect(hero).toContainText('Florence, SC');
    await expect(hero.getByRole('link', { name: EMAIL })).toHaveAttribute('href', `mailto:${EMAIL}`);
    await expect(hero.getByRole('link', { name: 'heyhannah.xyz' })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'linkedin.com/in/hannah-bailey-hb2023' })).toHaveAttribute(
      'href',
      LINKEDIN,
    );
    await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'href',
      '/hannah-bailey-resume.pdf',
    );
    await expect(hero).not.toContainText(/tel:|\(\d{3}\)\s?\d{3}[-.\s‑]\d{4}\b|\b\d{3}[-.‑]\d{3}[-.‑]\d{4}\b/);
  });

  test('runs the five sections in order', async ({ page }) => {
    await page.goto('/resume/');
    const headings = await page.locator('main h2').allTextContents();
    expect(headings).toEqual(['Summary', 'Core skills', 'Experience', 'Selected project', 'Education']);
    await expect(page.locator('main')).toContainText(
      'Technical writer, UX writer and content designer with 7+ years of experience',
    );
  });

  test('keeps the four core skill groups and their items', async ({ page }) => {
    await page.goto('/resume/');
    const skills = page.locator('.skills .skill');
    await expect(skills).toHaveCount(4);
    await expect(skills.locator('dt')).toHaveText([
      'Writing & Content',
      'Tools & Platforms',
      'Documentation',
      'Process',
    ]);
    await expect(skills.nth(0).locator('dd')).toContainText('Information Architecture');
    await expect(skills.nth(1).locator('dd')).toContainText('Heretto (CMS)');
    await expect(skills.nth(2).locator('dd')).toContainText('Help Center Management');
    await expect(skills.nth(3).locator('dd')).toContainText('AI-Assisted Workflows');
  });

  test('lists the five roles with the LinkedIn titles and dates', async ({ page }) => {
    await page.goto('/resume/');
    const jobs = page.locator('.rsection[aria-labelledby="experience-title"] .job');
    await expect(jobs).toHaveCount(5);
    await expect(jobs.locator('h3')).toHaveText([
      'Documentation and Information Management Specialist',
      'Senior UX Writer',
      'Junior UX Writer',
      'Technical Writer',
      'Technical Writing Intern',
    ]);
    await expect(jobs.locator('.job-dates')).toHaveText([
      'Jan 2026 – Present',
      'Dec 2023 – Dec 2025',
      'Aug 2021 – Dec 2023',
      'Jan 2019 – Aug 2021',
      'Jul 2018 – Jan 2019',
    ]);
    await expect(jobs.nth(0)).toContainText('Drs. Bruce and Lee Foundation · Florence, SC, hybrid');
    await expect(jobs.nth(1)).toContainText('owning 100% of Help Center content for Go Method and Growth Method products');
    await expect(jobs.nth(4)).toContainText('ACS Technologies');
  });

  test('includes the selected project and her education', async ({ page }) => {
    await page.goto('/resume/');
    const project = page.locator('.rsection[aria-labelledby="project-title"]');
    await expect(project.getByRole('heading', { level: 3 })).toHaveText('Integrating DocuSign with Go Method');
    await expect(project.locator('li')).toHaveCount(3);
    await expect(project).toContainText('established a reusable template for future integration documentation');

    const education = page.locator('.rsection[aria-labelledby="education-title"]');
    await expect(education.getByRole('heading', { level: 3 })).toHaveText('Francis Marion University');
    await expect(education).toContainText('2014 – 2018');
    await expect(education).toContainText(
      'Bachelor of Arts, Professional, Technical, Business & Scientific Writing',
    );
    await expect(education).toContainText('Assisting Editor, Snow Island Review Journal');
    await expect(education).toContainText('Student Government Association (SGA) Member');
  });

  test('ships a two-page PDF with her name and email, and no phone number', async () => {
    const pdf = await pdfText('dist/hannah-bailey-resume.pdf');
    expect(checkResumePdf(pdf)).toEqual([]);
    expect(pdf.pages).toBeLessThanOrEqual(2);
    expect(pdf.text).toContain('Hannah Bailey');
    expect(pdf.text).toContain(EMAIL);
  });
});
