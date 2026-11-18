import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { parseYamlData } from '../../src/lib/yaml-data';
import { site } from '../../src/lib/site';
import { featuredWork, nextWorkPage, workPage, workPages } from '../../src/lib/work';
import { quote, quotes, recommendationCount } from '../../src/lib/quotes';
import { resume } from '../../src/lib/resume';
import { about } from '../../src/lib/about';
import { photo, sample } from '../../src/lib/images';

describe('parseYamlData', () => {
  const Schema = z.object({ name: z.string(), count: z.number().int() });

  it('returns the validated object', () => {
    expect(parseYamlData('name: x\ncount: 3\n', Schema, 'test.yaml')).toEqual({ name: 'x', count: 3 });
  });

  it('names the file and the field when validation fails', () => {
    expect(() => parseYamlData('name: x\ncount: three\n', Schema, 'test.yaml')).toThrow(/test\.yaml.*count/s);
  });
});

describe('site facts', () => {
  it('uses her email as the only contact address, and has no phone number', () => {
    expect(site.email).toBe('baileyhannah995@gmail.com');
    expect(site).not.toHaveProperty('phone');
    expect(site.url).toBe('https://heyhannah.xyz');
    expect(site.location).toBe('Florence, SC');
  });

  it('states her three roles with equal weight, and her availability', () => {
    expect(site.roles).toBe('Technical writer · UX writer · Content designer');
    expect(site.availability).toBe('Open to remote, hybrid and on-site roles');
  });

  it('links her LinkedIn profile and Umbra Photography', () => {
    expect(site.linkedin).toBe('https://www.linkedin.com/in/hannah-bailey-hb2023/');
    expect(site.recommendations).toBe(
      'https://www.linkedin.com/in/hannah-bailey-hb2023/details/recommendations/',
    );
    expect(site.umbra).toBe('https://umbra.smugmug.com');
  });
});

describe('work pages', () => {
  it('has the six work pages in site order', () => {
    expect(workPages.map((page) => page.slug)).toEqual([
      'docusign-case-study',
      'help-centers',
      'onboarding',
      'microcopy',
      'video',
      'marketing-emails',
    ]);
  });

  it('features exactly the four home-page cards', () => {
    expect(featuredWork.map((page) => page.slug)).toEqual([
      'docusign-case-study',
      'help-centers',
      'microcopy',
      'video',
    ]);
  });

  it('gives every page a label, a title, a card summary, a lede and a body', () => {
    for (const page of workPages) {
      expect(page.label.length).toBeGreaterThan(0);
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.summary.length).toBeGreaterThan(0);
      expect(page.lede.length).toBeGreaterThan(0);
      expect(page.sections.length).toBeGreaterThan(0);
    }
  });

  it('wraps from the last work page back to the first', () => {
    expect(nextWorkPage('marketing-emails').slug).toBe('docusign-case-study');
    expect(nextWorkPage('docusign-case-study').slug).toBe('help-centers');
    expect(workPage('video').title).toBe('Product video and walkthroughs');
  });

  it('resolves every sample image and every email preview to a real file', () => {
    for (const page of workPages) {
      for (const image of page.images) expect(sample(image.key)).toBeTruthy();
      for (const file of page.files) {
        if (file.preview) expect(sample(file.preview)).toBeTruthy();
      }
    }
    expect(photo('headshot')).toBeTruthy();
    expect(photo('race')).toBeTruthy();
    expect(photo('hannah-kitten')).toBeTruthy();
  });

  it('gives every work quote an id that resolves', () => {
    for (const page of workPages) {
      if (page.quoteId) expect(quote(page.quoteId).name.length).toBeGreaterThan(0);
    }
  });

  it('keeps the case study to its seven Notion sections and one live guide', () => {
    const page = workPage('docusign-case-study');
    expect(page.sections.map((section) => section.heading)).toEqual([
      'Problem / opportunity',
      'Audience',
      'Goal',
      'Approach / my role',
      'Challenges & decisions',
      'Outcome / impact',
      'What this demonstrates',
    ]);
    expect(page.links).toHaveLength(1);
  });

  it('carries the three Help Center samples with descriptions and links', () => {
    const page = workPage('help-centers');
    const samples = page.sections.flatMap((section) => section.items);
    expect(samples.map((item) => item.label)).toEqual(['Integrations', 'People', 'Funding & Giving']);
    expect(samples.every((item) => item.description && item.href)).toBe(true);
  });

  it('has all eleven onboarding and release-note links', () => {
    const page = workPage('onboarding');
    const links = page.sections.flatMap((section) => section.items);
    expect(links).toHaveLength(11);
    expect(links.every((item) => item.href?.startsWith('https://help.acst.com/en/'))).toBe(true);
  });

  it('has five captioned microcopy screenshots and four email files with previews', () => {
    const microcopy = workPage('microcopy');
    expect(microcopy.images.map((image) => image.caption)).toEqual([
      'New user sign-in',
      'Informative icons for quick tasks',
      'Warning notifications',
      'AI + support chatbot',
      'Financial UI',
    ]);
    expect(microcopy.images.every((image) => image.alt.length > 40)).toBe(true);

    const marketing = workPage('marketing-emails');
    expect(marketing.files.map((file) => file.href)).toEqual([
      '/samples/email-1-welcome.pdf',
      '/samples/email-2-getting-started.pdf',
      '/samples/email-3-integrations.pdf',
      '/samples/email-4-best-use-cases.pdf',
    ]);
    expect(marketing.files.every((file) => file.preview && file.previewAlt)).toBe(true);
    expect(marketing.quoteId).toBe('ken-brisco');
  });
});

describe('quotes', () => {
  it('records the ten LinkedIn recommendations behind the proof strip', () => {
    expect(recommendationCount).toBe(10);
  });

  it('keeps every displayed quote verbatim, with a name, role and relationship', () => {
    expect(quotes).toHaveLength(7);
    expect(quotes.map((entry) => entry.name)).toEqual([
      'Barbara Green',
      'Barbara Green',
      'Dale Ahn',
      'Dani Robertshaw',
      'Patrice Bethea',
      'Amy Lauren Scott',
      'Ken Brisco',
    ]);
    expect(quote('barbara-green-home').text).toBe(
      'She writes compelling, thoughtful UX copy and has a strong instinct for creating content that truly helps users succeed.',
    );
    expect(quote('ken-brisco').role).toBe('Product Marketing');
  });
});

describe('resume', () => {
  it('names her three roles at the top, in title case', () => {
    expect(resume.headline).toBe('Technical Writer · UX Writer · Content Designer');
  });

  it('opens with the summary from her LinkedIn About', () => {
    expect(resume.summary).toMatch(/^UX Writer and Content Designer with 7\+ years of experience/);
  });

  it('lists the roles with the titles, dates and bullet counts from LinkedIn', () => {
    expect(resume.experience.map((job) => [job.title, job.dates])).toEqual([
      ['Documentation and Information Management Specialist', 'Jan 2026 – Present'],
      ['Senior UX Writer', 'Dec 2023 – Dec 2025'],
      ['Junior UX Writer', 'Aug 2021 – Dec 2023'],
      ['Technical Writer', 'Jan 2019 – Aug 2021'],
      ['Technical Writing Intern', 'Jul 2018 – Jan 2019'],
    ]);
    expect(resume.experience.map((job) => job.bullets.length)).toEqual([4, 8, 6, 6, 5]);
  });

  it('covers the four skill groups, the selected project and her degree', () => {
    expect(resume.skills.map((group) => group.name)).toEqual([
      'Writing & Content',
      'Tools & Platforms',
      'Documentation',
      'Process',
    ]);
    expect(resume.selectedProject.title).toBe('Integrating DocuSign with Go Method');
    expect(resume.education.school).toBe('Francis Marion University');
    expect(resume.education.dates).toBe('2014 – 2018');
  });
});

describe('about', () => {
  it('keeps her five roles in order, ending with the foundation', () => {
    expect(about.story.roles.map((role) => [role.title, role.dates])).toEqual([
      ['Technical Writing Intern', 'Jul 2018 – Jan 2019'],
      ['Technical Writer', 'Jan 2019 – Aug 2021'],
      ['Junior UX Writer', 'Aug 2021 – Dec 2023'],
      ['Senior UX Writer', 'Dec 2023 – Dec 2025'],
      ['Documentation and Information Management Specialist', 'Jan 2026 – Present'],
    ]);
    expect(about.story.roles.at(-1)?.employer).toBe('Drs. Bruce and Lee Foundation');
  });

  it('uses the five kind-word quotes, each resolving to a name and role', () => {
    expect(about.kindWords.quoteIds).toEqual([
      'barbara-green-about',
      'dale-ahn',
      'dani-robertshaw',
      'patrice-bethea',
      'amy-lauren-scott',
    ]);
    expect(about.kindWords.quoteIds.map((id) => quote(id).name)).toEqual([
      'Barbara Green',
      'Dale Ahn',
      'Dani Robertshaw',
      'Patrice Bethea',
      'Amy Lauren Scott',
    ]);
  });

  it('resolves every About photo, and gives the kitten gallery two described images', () => {
    expect(photo(about.beyond.photography.image)).toBeTruthy();
    expect(photo(about.beyond.fostering.image)).toBeTruthy();
    expect(about.beyond.fostering.gallery.map((entry) => entry.image)).toEqual(['kitten-1', 'kitten-2']);
    for (const entry of about.beyond.fostering.gallery) {
      expect(photo(entry.image)).toBeTruthy();
      expect(entry.alt.length).toBeGreaterThan(20);
    }
  });

  it('keeps her Notion line about life beyond work', () => {
    expect(about.beyond.personal).toBe(
      'Whether I’m absorbed in a good book, traveling, dilly-dallying in Animal Crossing, or spending time at the beach, I bring the same curiosity to my life as I do to my work.',
    );
  });

  it('is honest about AI and names the adjacent work', () => {
    expect(about.howIWork.ai.text).toMatch(/^I haven’t owned a fully AI-driven product yet\./);
    expect(about.howIWork.ai.text).toContain('designing guided user flows');
  });
});

describe('no stray contact details in the data', () => {
  it('mentions no phone number and no other email address', () => {
    const all = JSON.stringify({ site, workPages, quotes, resume, about });
    expect(all).not.toMatch(/tel:|\(\d{3}\)\s?\d{3}[-.\s‑]\d{4}\b|\b\d{3}[-.‑]\d{3}[-.‑]\d{4}\b/);
    const emails = all.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];
    expect(emails.every((email) => email.toLowerCase() === 'baileyhannah995@gmail.com')).toBe(true);
  });
});
