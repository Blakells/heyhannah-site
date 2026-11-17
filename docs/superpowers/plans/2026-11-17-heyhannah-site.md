# heyhannah.xyz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build heyhannah.xyz, Hannah Bailey's portfolio site for recruiters and hiring managers, as specified in
`docs/superpowers/specs/2026-11-17-heyhannah-site-design.md`, and launch it on GitHub Pages.

**Architecture:** A static Astro site. Every fact and every line of copy lives in YAML under `src/data/`, validated
by a zod schema at build time, so a content change is a data edit. Small Astro components render it; six page
files (Home, the Work index, one route for the six work pages, About, Resume and 404) compose the components. The
build also prints the Resume page to `dist/hannah-bailey-resume.pdf` and checks the PDF's text. A GitHub Actions
workflow builds once, runs every check against that build, and only then deploys it to GitHub Pages.

**Tech Stack:** Astro 7.4.8, TypeScript 6.0.3, Vitest 5.1.0, Playwright 1.65.0 with axe, pdf.js 6.5.438,
html-validate, linkinator, Lighthouse CI, and self-hosted Fontsource fonts (Fraunces variable, Source Sans 3). The
tooling matches blakells.dev and umbreonics.com.

**Public repository.** `Blakells/heyhannah-site` is public. The only email address anywhere in it is
`baileyhannah995@gmail.com`, her phone number never appears, and nothing about her goes in that the site itself
does not say. Test strings shaped like an address or a phone number are split (`'someone' + '@example.com'`), so
no whole one sits in the repository.

**Already in the repository:** this plan, the spec, `.gitignore`, the cleaned photos in `src/assets/photos/`, the
work-sample images in `src/assets/samples/` and the four email PDFs in `public/samples/`. Use them as they are;
they were cropped, resized and stripped of metadata before they were committed.

**Running Playwright.** Install Chromium once per machine with `npx playwright install chromium`. If browsers live
elsewhere, set `PLAYWRIGHT_BROWSERS_PATH` for every command that runs Playwright (`npx playwright test`,
`npm run build` from Task 11 on, `npm run check`, `npm run make:og`).

**Building before Task 11.** `npm run build` runs `astro build` and then prints the resume PDF, and the PDF script
only arrives in Task 11. Until then, build with `npx astro build`.

---

## File structure

```text
package.json, package-lock.json     dependencies and scripts (npm run check runs everything CI runs)
.nvmrc                              the Node version
astro.config.mjs                    static site, trailing slashes, sitemap
tsconfig.json, vitest.config.ts, playwright.config.ts
.htmlvalidate.json, lighthouserc.json
.github/workflows/ci.yml            build, check, then deploy to Pages
README.md

src/data/site.yaml                  name, URL, email, LinkedIn, Umbra, location, roles, availability
src/data/work.yaml                  the six work pages: cards, sections, links, images, files
src/data/quotes.yaml                the recommendation quotes and the count
src/data/about.yaml                 the About page: story, timeline, how she works, quotes, photos
src/data/resume.yaml                the resume: summary, skills, experience, project, education
src/lib/yaml-data.ts                parse + validate a YAML file, naming the failing fields
src/lib/site.ts, work.ts, quotes.ts, about.ts, resume.ts   the data, typed, with small helpers
src/lib/images.ts                   the photos and samples by key, for astro:assets
src/styles/tokens.css               colors, type, spacing ("Sun & Surf")
src/styles/global.css               base styles and shared classes (.wrap, .label, .prose, ...)
src/layouts/BaseLayout.astro        head, fonts, skip link, header, main, footer
src/components/WaveMark.astro       the wave mark (inline SVG)
src/components/Button.astro         primary and ghost buttons
src/components/SiteHeader.astro     wordmark, Work · About · Resume, "Email me"
src/components/SiteFooter.astro     copyright line, email and LinkedIn
src/components/WaveDivider.astro    the wave between bands
src/components/ProofStrip.astro     the four proof figures
src/components/WorkCard.astro       one work card, linked to its page
src/components/Quote.astro          a recommendation quote with its attribution
src/components/PhotoPanel.astro     a photo with a title, a line and an optional link
src/components/WorkPageShell.astro  label, h1, lede, body, live examples, next and back
src/pages/index.astro               Home
src/pages/work/index.astro          the Work index
src/pages/work/[slug].astro         the six work pages
src/pages/about.astro, resume.astro, 404.astro
public/favicon.svg, public/og.png

scripts/lib/serve.mjs               serve dist/ the way GitHub Pages does (tests, PDF printing, preview)
scripts/serve.mjs                   npm run preview
scripts/lib/pdf-text.mjs            extract and check the resume PDF's text
scripts/resume-pdf.mjs              print /resume/ to dist/hannah-bailey-resume.pdf and check it
scripts/lib/content-rules.mjs       the content rules (spec section 3)
scripts/check-content.mjs           apply them to src/, public/ and dist/
scripts/make-og.mjs                 render public/og.png

tests/unit/*.test.ts                Vitest
tests/e2e/*.spec.ts, pages.ts       Playwright
```

---

## Phase 1: Project and content

### Task 1: Project files and dependencies

**Files:**
- Create: `package.json`, `.nvmrc`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`

The `overrides` entry keeps `@axe-core/playwright` on the same `playwright-core` as `@playwright/test`; without it
the type check fails on two different `Page` types.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "heyhannah-site",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.23.4"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && node scripts/resume-pdf.mjs",
    "preview": "node scripts/serve.mjs",
    "check:types": "astro check",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "check:content": "node scripts/check-content.mjs",
    "check:html": "html-validate \"dist/**/*.html\"",
    "check:links": "linkinator dist --recurse --skip '^https?://(?!127\\.0\\.0\\.1)'",
    "check:lighthouse": "lhci autorun",
    "check": "npm run check:types && npm run test:unit && npm run build && npm run check:content && npm run check:html && npm run check:links && npm run test:e2e && npm run check:lighthouse",
    "make:og": "node scripts/make-og.mjs"
  },
  "dependencies": {
    "@astrojs/sitemap": "3.7.4",
    "@fontsource-variable/fraunces": "5.3.0",
    "@fontsource/source-sans-3": "5.3.1",
    "astro": "7.4.8",
    "yaml": "2.9.1"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.12",
    "@axe-core/playwright": "4.14.0",
    "@lhci/cli": "0.16.0",
    "@playwright/test": "1.65.0",
    "html-validate": "11.21.0",
    "linkinator": "8.1.0",
    "pdfjs-dist": "6.5.438",
    "typescript": "6.0.3",
    "vitest": "5.1.0"
  },
  "overrides": {
    "playwright-core": "1.65.0"
  }
}
```

- [ ] **Step 2: Create `.nvmrc`**

```text
24
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://heyhannah.xyz',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", ".lighthouseci", "test-results", "playwright-report"]
}
```

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: { include: ['tests/unit/**/*.test.ts'] },
});
```

- [ ] **Step 6: Install**

Run: `npm install && npx playwright install chromium && npx astro --version`
Expected: the install finishes and the last line names Astro `v7.4.8`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .nvmrc astro.config.mjs tsconfig.json vitest.config.ts
git commit -m "Set up the Astro project

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Her content

**Files:**
- Create: `src/lib/yaml-data.ts`, `src/data/site.yaml`, `src/lib/site.ts`, `src/data/work.yaml`, `src/lib/work.ts`, `src/data/quotes.yaml`, `src/lib/quotes.ts`, `src/data/about.yaml`, `src/lib/about.ts`, `src/data/resume.yaml`, `src/lib/resume.ts`, `src/lib/images.ts`
- Test: `tests/unit/data.test.ts`

Every line of copy traces to her resume, her Notion portfolio, her LinkedIn profile or Blake's answers (spec
sections 2 and 3). Titles and dates follow LinkedIn. The schemas pin the shape (six work pages with unique slugs,
four of them featured; five different quotes on the About page), and the tests check the rest, such as the ten
recommendations and the fourteen onboarding links. `images.ts` maps keys to the committed photos and samples.

- [ ] **Step 1: Create `tests/unit/data.test.ts`** (the failing test)

```ts
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

  it('has all fourteen onboarding and release-note links', () => {
    const page = workPage('onboarding');
    const links = page.sections.flatMap((section) => section.items);
    expect(links).toHaveLength(14);
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

  it('opens with the site-positioned summary', () => {
    expect(resume.summary).toMatch(/^Technical writer, UX writer and content designer with 7\+ years of experience/);
  });

  it('lists the roles with the titles and dates from LinkedIn', () => {
    expect(resume.experience.map((job) => [job.title, job.dates])).toEqual([
      ['Documentation and Information Management Specialist', 'Jan 2026 – Present'],
      ['Senior UX Writer', 'Dec 2023 – Dec 2025'],
      ['Junior UX Writer', 'Aug 2021 – Dec 2023'],
      ['Technical Writer', 'Jan 2019 – Aug 2021'],
      ['Technical Writing Intern', 'Jul 2018 – Jan 2019'],
    ]);
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
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/unit/data.test.ts`
Expected: FAIL, because `src/lib/yaml-data.ts` does not exist yet.

- [ ] **Step 3: Create `src/lib/yaml-data.ts`**

```ts
import { parse } from 'yaml';
import type { z } from 'astro/zod';

/** Parse a YAML string and validate it, naming the file and the failing fields in the error. */
export function parseYamlData<T extends z.ZodType>(raw: string, schema: T, file: string): z.infer<T> {
  const result = schema.safeParse(parse(raw));
  if (!result.success) {
    const fields = result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    throw new Error(`${file} is invalid:\n${fields.join('\n')}`);
  }
  return result.data;
}
```

- [ ] **Step 4: Create `src/data/site.yaml`**

```yaml
name: Hannah Bailey
url: https://heyhannah.xyz
email: baileyhannah995@gmail.com
linkedin: https://www.linkedin.com/in/hannah-bailey-hb2023/
recommendations: https://www.linkedin.com/in/hannah-bailey-hb2023/details/recommendations/
umbra: https://umbra.smugmug.com
location: Florence, SC
roles: Technical writer · UX writer · Content designer
availability: Open to remote, hybrid and on-site roles
```

- [ ] **Step 5: Create `src/lib/site.ts`**

```ts
import { z } from 'astro/zod';
import raw from '../data/site.yaml?raw';
import { parseYamlData } from './yaml-data';

const Site = z.object({
  name: z.string(),
  url: z.url(),
  email: z.email(),
  linkedin: z.url(),
  recommendations: z.url(),
  umbra: z.url(),
  location: z.string(),
  roles: z.string(),
  availability: z.string(),
});

export type Site = z.infer<typeof Site>;
export const site: Site = parseYamlData(raw, Site, 'src/data/site.yaml');
```

- [ ] **Step 6: Create `src/data/work.yaml`**

```yaml
- slug: docusign-case-study
  label: Case study
  title: Integrating DocuSign with Go Method
  summary: A step-by-step admin guide for a confusing setup, which reduced support inquiries and became the template for future integration docs.
  featured: true
  lede: How I turned a confusing DocuSign integration setup into a step-by-step guide that administrators could follow on their own.
  sections:
    - heading: Problem / opportunity
      paragraphs:
        - Customers needed a clear, step-by-step guide to configure DocuSign digital signatures in Go Method. Ambiguity in setup was driving support tickets and inconsistent adoption.
    - heading: Audience
      paragraphs:
        - Go Method administrators and platform implementers — both technical and non-technical users.
    - heading: Goal
      paragraphs:
        - Decrease support volume, increase self-serve success, and provide a scalable reference for both users and internal support teams.
    - heading: Approach / my role
      paragraphs:
        - I collaborated with engineering and product SMEs, mapped the integration workflow, translated requirements into clear steps, and authored documentation that aligned with established style and usability standards.
    - heading: Challenges & decisions
      paragraphs:
        - Balanced variable audience skill levels, maintained accuracy amid evolving product behavior, and standardized structure for future reuse.
    - heading: Outcome / impact
      paragraphs:
        - Reduced support inquiries, provided a scalable reference, and influenced future integration documentation templates.
    - heading: What this demonstrates
      paragraphs:
        - Strategic documentation skills, cross-functional collaboration, and ability to simplify complex technical workflows.
  links:
    - label: DocuSign integration guide in the Go Method Help Center
      href: https://help.acst.com/en/go-method/how-to/integrations/digital-signatures/docusign

- slug: help-centers
  label: Documentation
  title: Help Centers for Go Method and Growth Method
  summary: Owned the information architecture, articles and metadata for two SaaS products, end to end.
  featured: true
  lede: I owned 100% of Help Center content for Go Method and Growth Method, from information architecture and article structure to topic metadata.
  sections:
    - heading: What I owned
      paragraphs:
        - I led documentation and UX content strategy for multi-product cloud SaaS platforms. Across both product Help Centers I drove information architecture, article structure and topic metadata, and defined scalable content frameworks for long-term maintainability.
    - heading: Live examples
      items:
        - label: Integrations
          description: Simplified complex system integrations — covering payments, background checks, e-signatures and travel tools — into clear, actionable content for users.
          href: https://help.acst.com/en/go-method/how-to/integrations
        - label: People
          description: Improved clarity around participant management by writing intuitive, step-by-step guidance for creating, updating and organizing user profiles.
          href: https://help.acst.com/en/go-method/how-to/manage-people/participants/participant-profiles
        - label: Funding & Giving
          description: Simplified donation flows and funding milestones, helping users track contributions and manage financial goals with clarity.
          href: https://help.acst.com/en/go-method/how-to/giving/allocation-types

- slug: onboarding
  label: Documentation
  title: Onboarding & release notes
  summary: Getting-started guides, first-time setup and release notes, written alongside frequent Agile releases.
  featured: false
  lede: Onboarding documentation and multi-step workflows designed to reduce setup friction and support self-serve adoption for new customers.
  sections:
    - heading: Onboarding
      paragraphs:
        - Getting-started guides and multi-step workflows that help new customers find their way around the product.
      items:
        - label: Getting Started in Go Method
          href: https://help.acst.com/en/go-method/guides/getting-started-in-go-method
        - label: Trip Management for Team Leaders
          href: https://help.acst.com/en/go-method/guides/trip-management-for-team-leaders
        - label: Getting Started in Growth Method
          href: https://help.acst.com/en/growth-method/guides/getting-started-in-growth-method
        - label: Best Practices
          href: https://help.acst.com/en/growth-method/guides/best-practices/dynamic-fields
        - label: Daily Management
          href: https://help.acst.com/en/growth-method/guides/daily-management/roles
    - heading: First-time setup
      paragraphs:
        - The setup steps new administrators need before the product can do its work.
      items:
        - label: Accounts
          href: https://help.acst.com/en/go-method/how-to/accounts
        - label: Event Checklist
          href: https://help.acst.com/en/go-method/how-to/event-checklist
        - label: Roles & Permissions
          href: https://help.acst.com/en/go-method/how-to/manage-people/roles-and-permissions/roles-in-go-method
    - heading: Release notes ("What's new")
      paragraphs:
        - Feature documentation produced in an Agile environment, aligned with frequent product releases and evolving system behavior.
      items:
        - label: Go Method — January 31, 2024
          href: https://help.acst.com/en/go-method/whats-new/2024/january-31-2024
        - label: Go Method — September 13, 2024
          href: https://help.acst.com/en/go-method/whats-new/2024/september-13-2024
        - label: Go Method — December 6, 2024
          href: https://help.acst.com/en/go-method/whats-new/2024/december-6-2024
        - label: Go Method — February 17, 2025
          href: https://help.acst.com/en/go-method/whats-new/2025/february-17-2025
        - label: Go Method — March 28, 2025
          href: https://help.acst.com/en/go-method/whats-new/2025/march-28-2025
        - label: Go Method — July 29, 2025
          href: https://help.acst.com/en/go-method/whats-new/2025/july-29-2025

- slug: microcopy
  label: UX writing
  title: Microcopy across multiple products
  summary: "Sign-in, warnings, an AI support chatbot and financial UI: the small words that keep users moving."
  featured: true
  lede: A few samples of my microcopy across multiple products.
  sections:
    - heading: Samples
      paragraphs:
        - These screens come from several products and cover the moments where a few words decide whether someone keeps going.
  images:
    - key: microcopy-new-user-sign-in
      caption: New user sign-in
      alt: Two phone screens for signing in to Growth Method. The first asks for an organization code, with the note "Can be found in your welcome email"; the second asks for a username and password.
    - key: microcopy-informative-icons
      caption: Informative icons for quick tasks
      alt: A Max Capacity field with an Allow Guests checkbox and an info tooltip reading "When Allow Guests is selected, individuals can add guests during their registration."
    - key: microcopy-warning-notifications
      caption: Warning notifications
      alt: Two warning dialogs. Remove Pending Invites says the action cannot be undone and asks for a reason; Cancel Event explains that a registration event cannot be reinstated once canceled.
    - key: microcopy-ai-support-chatbot
      caption: AI + support chatbot
      alt: An ACS Technologies support chat that promises to connect the visitor with an agent, then an after-hours reply pointing to the Help Center.
    - key: microcopy-financial-ui
      caption: Financial UI
      alt: A Billing Details invoice view with the invoice number, status, dates and a table of line items and totals.

- slug: video
  label: Video
  title: Product video and walkthroughs
  summary: Led UX video across R&D, from scripts and recording to graphics, thumbnails and team training.
  featured: true
  lede: I expanded the Help Center experience into multimodal learning by introducing instructional video and visual walkthroughs—ensuring content was accessible to users with different learning preferences.
  sections:
    - heading: How I worked
      paragraphs:
        - I led UX video content across R&D, establishing production guidelines, defining quality and consistency standards, and building a scalable framework for video creation across teams.
        - This included scripting, recording, editing, and designing supporting visuals such as graphics and thumbnails to enhance clarity and engagement.
        - Beyond production, I trained team members, interns and cross-functional partners on video tools and best practices, enabling broader adoption and ensuring content quality.
        - This work extended documentation beyond static articles into guided, experience-driven content that more closely mirrors how users learn and interact with complex systems. To really drive user experience, I would pair the video content with my onboarding flows.
  links:
    - label: Go Method video basics
      href: https://help.acst.com/en/go-method/video/go-method-basics
    - label: Realm getting-started videos
      href: https://help.acst.com/en/realm/video-library/realm-video-library/getting-started--setup

- slug: marketing-emails
  label: Marketing
  title: Marketing emails
  summary: A four-email trial series and first-touch Help Center hubs, built to reduce overwhelm and drive self-serve onboarding.
  featured: false
  lede: A series of drip emails for new clients on a 30-day trial, written with the AIDA framework, plus first-touch Help Center experiences.
  sections:
    - heading: The trial email series
      paragraphs:
        - I wrote a series of drip emails for new clients using the AIDA framework (clients were on a 30-day trial). Below are 4 pieces of that series.
    - heading: First-touch hubs
      paragraphs:
        - I also designed first-touch help center experiences using a Problem → Value → Guided Action framework to reduce user overwhelm and drive self-serve onboarding.
      items:
        - label: Your mission — trip management hub
          href: https://help.acst.com/en/go-method/guides/your-mission-trip-management-hub
        - label: Your ministry — growth hub
          href: https://help.acst.com/en/growth-method/guides/your-ministry-growth-hub
  files:
    - label: Welcome
      href: /samples/email-1-welcome.pdf
      preview: email-1-preview
      previewAlt: Preview of the Welcome email, the first in the trial series.
    - label: Getting started
      href: /samples/email-2-getting-started.pdf
      preview: email-2-preview
      previewAlt: Preview of the Getting started email, the second in the trial series.
    - label: Integrations
      href: /samples/email-3-integrations.pdf
      preview: email-3-preview
      previewAlt: Preview of the Integrations email, the third in the trial series.
    - label: Best use cases
      href: /samples/email-4-best-use-cases.pdf
      preview: email-4-preview
      previewAlt: Preview of the Best use cases email, the fourth in the trial series.
  quoteId: ken-brisco
```

- [ ] **Step 7: Create `src/lib/work.ts`**

```ts
import { z } from 'astro/zod';
import raw from '../data/work.yaml?raw';
import { parseYamlData } from './yaml-data';

/** A link in a body section: an external example or an in-page reference. */
const WorkItem = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  href: z.url().optional(),
});

/** A run of prose, optionally with a list of labelled links, under one heading. */
const WorkSection = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string()).default([]),
  items: z.array(WorkItem).default([]),
});

/** An image in src/assets/samples/, referenced by its file name without the extension. */
const WorkImage = z.object({
  key: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

/** A file a visitor can open, with an optional preview image key. */
const WorkFile = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  preview: z.string().optional(),
  previewAlt: z.string().optional(),
});

export const WorkPage = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  featured: z.boolean(),
  lede: z.string().min(1),
  sections: z.array(WorkSection).min(1),
  links: z.array(z.object({ label: z.string().min(1), href: z.url() })).default([]),
  images: z.array(WorkImage).default([]),
  files: z.array(WorkFile).default([]),
  quoteId: z.string().optional(),
});

export type WorkItem = z.infer<typeof WorkItem>;
export type WorkSection = z.infer<typeof WorkSection>;
export type WorkImage = z.infer<typeof WorkImage>;
export type WorkFile = z.infer<typeof WorkFile>;
export type WorkPage = z.infer<typeof WorkPage>;

const Work = z
  .array(WorkPage)
  .length(6)
  .refine((pages) => new Set(pages.map((p) => p.slug)).size === pages.length, {
    message: 'every work page needs a unique slug',
  })
  .refine((pages) => pages.filter((p) => p.featured).length === 4, {
    message: 'exactly four work pages are featured on the home page',
  });

/** The six work pages, in site order (the order used for "Next" links). */
export const workPages: WorkPage[] = parseYamlData(raw, Work, 'src/data/work.yaml');

/** The four work pages shown on the home page. */
export const featuredWork: WorkPage[] = workPages.filter((page) => page.featured);

/** The URL of a work page. */
export function workHref(slug: string): string {
  return `/work/${slug}/`;
}

/** One work page by slug; throws when there is no such page. */
export function workPage(slug: string): WorkPage {
  const page = workPages.find((entry) => entry.slug === slug);
  if (!page) throw new Error(`No work page with slug "${slug}"`);
  return page;
}

/** The work page after this one, wrapping from the last back to the first. */
export function nextWorkPage(slug: string): WorkPage {
  const index = workPages.findIndex((entry) => entry.slug === slug);
  if (index === -1) throw new Error(`No work page with slug "${slug}"`);
  return workPages[(index + 1) % workPages.length]!;
}
```

- [ ] **Step 8: Create `src/data/quotes.yaml`**

```yaml
count: 10
items:
  - id: barbara-green-home
    text: "She writes compelling, thoughtful UX copy and has a strong instinct for creating content that truly helps users succeed."
    name: Barbara Green
    role: UX Content Strategy & Operations
    relationship: managed Hannah directly at ACS Technologies
  - id: barbara-green-about
    text: "Hannah supported multiple products and consistently got up to speed quickly, taking the time to deeply understand and empathize with our customers."
    name: Barbara Green
    role: UX Content Strategy & Operations
    relationship: her manager
    showRelationship: true
  - id: dale-ahn
    text: "She's a stellar UX writer who quickly understands user intent and needs, creating in-product content that helped elevate my design solutions."
    name: Dale Ahn
    role: UX Design Manager
    relationship: colleague on the same team
  - id: dani-robertshaw
    text: "She knows how to dissect complex information and transform it into easy-to-understand documentation."
    name: Dani Robertshaw
    role: Technical Writer
    relationship: colleague on the same team
  - id: patrice-bethea
    text: "As a UX writer, Hannah took the time to deeply understand each project's goals and user needs, and she translated complex ideas into clear, effective messaging for clients."
    name: Patrice Bethea
    role: Product Owner
    relationship: colleague on the same team
  - id: amy-lauren-scott
    text: "I watched her grow from a college intern during her senior year at Francis Marion University to a Senior Technical/UX/Content Writer."
    name: Amy Lauren Scott
    role: Professional & Technical Writer
    relationship: colleague on the same team
  - id: ken-brisco
    text: "She knows how to communicate value in a way customers can easily consume without overwhelming them with unnecessary jargon or noise."
    name: Ken Brisco
    role: Product Marketing
    relationship: ACS Technologies
```

- [ ] **Step 9: Create `src/lib/quotes.ts`**

```ts
import { z } from 'astro/zod';
import raw from '../data/quotes.yaml?raw';
import { parseYamlData } from './yaml-data';

export const Quote = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  relationship: z.string().min(1),
  /** Show the relationship in the attribution, as the spec does for Barbara Green on About. */
  showRelationship: z.boolean().optional(),
});

const Quotes = z
  .object({
    count: z.number().int().positive(),
    items: z.array(Quote).min(1),
  })
  .refine((all) => new Set(all.items.map((q) => q.id)).size === all.items.length, {
    message: 'every quote needs a unique id',
  });

export type Quote = z.infer<typeof Quote>;

const quotesData = parseYamlData(raw, Quotes, 'src/data/quotes.yaml');

/** Every quote the site uses, keyed by id. */
export const quotes: Quote[] = quotesData.items;

/** How many recommendations Hannah has on LinkedIn (the proof strip figure). */
export const recommendationCount: number = quotesData.count;

/** One quote by id; throws when there is no such quote. */
export function quote(id: string): Quote {
  const entry = quotes.find((q) => q.id === id);
  if (!entry) throw new Error(`No quote with id "${id}"`);
  return entry;
}
```

- [ ] **Step 10: Create `src/data/about.yaml`**

```yaml
hero:
  eyebrow: About
  title: About Hannah
  lede: "I design clear, user-centered content for SaaS products — improving onboarding, product flows, and customer understanding through UX writing, documentation, and video."

story:
  paragraphs:
    - "I started at ACS Technologies as a technical writing intern during my senior year at Francis Marion University. The internship led directly to a full-time position, and I stayed more than seven years, moving from technical writing into UX writing and content design."
    - "In January 2026 I joined the Drs. Bruce and Lee Foundation as Documentation and Information Management Specialist. There I designed a SharePoint records system for more than 30 years of the foundation’s records: the information architecture, taxonomy, metadata and naming conventions that turned a large, fragmented archive into a structured, searchable resource."
  roles:
    - title: Technical Writing Intern
      employer: ACS Technologies
      dates: Jul 2018 – Jan 2019
      note: Supported documentation and video production for SaaS products during a hands-on internship.
    - title: Technical Writer
      employer: ACS Technologies
      dates: Jan 2019 – Aug 2021
      note: Authored Help Center articles and integration guides, and led instructional video production.
    - title: Junior UX Writer
      employer: ACS Technologies
      dates: Aug 2021 – Dec 2023
      note: Moved into UX content, shaping in-product copy and documentation strategy for complex SaaS platforms.
    - title: Senior UX Writer
      employer: ACS Technologies
      dates: Dec 2023 – Dec 2025
      note: Owned 100% of Help Center content for Go Method and Growth Method, and led UX content strategy across products.
    - title: Documentation and Information Management Specialist
      employer: Drs. Bruce and Lee Foundation
      dates: Jan 2026 – Present
      note: Designed a centralized SharePoint records system covering more than 30 years of organizational records.

howIWork:
  paragraphs:
    - "I like to get involved in the project or problem BEFORE the UI exists. I typically start from the beginning — “Why are we doing this?” — and from there I can define the problem. This is where content begins."
    - "I have a lot of experience on Agile teams, working cross-functionally with product owners, engineers and support teams. I’ve embedded content into the product lifecycle, keeping documentation in sync with system changes and serving both user needs and business goals."
    - "I think less about the screen and more about the user case and how they will transition throughout the product."
  creates:
    intro: "I create help content, user workflows, error state pages and responses, onboarding, product microcopy, UX strategy and video strategy, and conversation design thinking."
    items:
      - Help content
      - User workflows
      - Error states and responses
      - Onboarding
      - Product microcopy
      - UX and video strategy
      - Conversation design thinking
  ai:
    label: On AI
    text: "I haven’t owned a fully AI-driven product yet. I’ve done a lot of adjacent work — like designing guided user flows, writing system responses, and handling new errors or use cases as they come up."

kindWords:
  quoteIds:
    - barbara-green-about
    - dale-ahn
    - dani-robertshaw
    - patrice-bethea
    - amy-lauren-scott

beyond:
  photography:
    title: Motorsports photography
    text: "I shoot motorcycle racing up and down the East Coast as Umbra Photography: fast subjects, changing light, tight deadlines."
    image: race
    alt: "Two motorcycles leaning into a corner on a race track, a red bike leading"
  fostering:
    title: Kitten fostering
    text: "I rescue and foster kittens until they’re healthy, social and ready for a home of their own."
    image: hannah-kitten
    alt: "Hannah holding a tabby kitten"
    gallery:
      - image: kitten-1
        alt: "A tabby kitten with a rust-colored patch on its nose, held close to the camera"
      - image: kitten-2
        alt: "A green-eyed tabby kitten sitting on a pale blue chair and looking up"
  personal: "Whether I’m absorbed in a good book, traveling, dilly-dallying in Animal Crossing, or spending time at the beach, I bring the same curiosity to my life as I do to my work."
```

- [ ] **Step 11: Create `src/lib/about.ts`**

```ts
import { z } from 'astro/zod';
import raw from '../data/about.yaml?raw';
import { parseYamlData } from './yaml-data';

const Role = z.object({
  title: z.string().min(1),
  employer: z.string().min(1),
  dates: z.string().min(1),
  note: z.string().min(1).optional(),
});

const ImageEntry = z.object({
  image: z.string().min(1),
  alt: z.string().min(1),
});

const About = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    lede: z.string().min(1),
  }),
  story: z.object({
    paragraphs: z.array(z.string().min(1)).min(1),
    roles: z.array(Role).min(1),
  }),
  howIWork: z.object({
    paragraphs: z.array(z.string().min(1)).min(1),
    creates: z.object({
      intro: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
    ai: z.object({
      label: z.string().min(1),
      text: z.string().min(1),
    }),
  }),
  kindWords: z.object({
    quoteIds: z
      .array(z.string().min(1))
      .length(5)
      .refine((ids) => new Set(ids).size === ids.length, { message: 'every kind word needs its own quote' }),
  }),
  beyond: z.object({
    photography: ImageEntry.extend({
      title: z.string().min(1),
      text: z.string().min(1),
    }),
    fostering: ImageEntry.extend({
      title: z.string().min(1),
      text: z.string().min(1),
      gallery: z.array(ImageEntry).min(1),
    }),
    personal: z.string().min(1),
  }),
});

export type AboutData = z.infer<typeof About>;

/** The About page's copy: her story, how she works, kind words and life beyond the docs. */
export const about: AboutData = parseYamlData(raw, About, 'src/data/about.yaml');
```

- [ ] **Step 12: Create `src/data/resume.yaml`**

```yaml
headline: Technical Writer · UX Writer · Content Designer
summary: >-
  Technical writer, UX writer and content designer with 7+ years of experience owning end-to-end documentation for complex cloud-based SaaS platforms. Specializes in Help Center architecture, developer-adjacent documentation, onboarding content, and UX writing that reduces friction and drives product adoption. Proven ability to translate intricate system behavior into clear, structured content for both technical and non-technical audiences. Strong cross-functional collaborator in Agile environments, partnering with engineering, product, design, and compliance teams to deliver accurate, user-centered content under tight release cycles.
skills:
  - name: Writing & Content
    items:
      - Technical Writing
      - UX Writing
      - Content Strategy
      - Information Architecture
      - Taxonomy & Metadata
      - Documentation Architecture
      - Style Guide Development
      - Voice & Tone
      - Copyediting
  - name: Tools & Platforms
    items:
      - Heretto (CMS)
      - DITA
      - SharePoint
      - Jira
      - GitHub
      - Pendo
      - Sigma
      - Figma
      - FigJam
      - Camtasia
      - Videate
      - Google Analytics
      - Affinity Suite
  - name: Documentation
    items:
      - API Documentation
      - Help Center Management
      - Onboarding Flows
      - Knowledge Bases
      - Release Notes
      - Integration Guides
      - In-App Guidance
      - Document & Records Management
  - name: Process
    items:
      - Agile Methodology
      - Cross-Functional Collaboration
      - SME Interviewing
      - Content Auditing
      - Content Governance
      - Analytics-Driven Optimization
      - AI-Assisted Workflows
experience:
  - title: Documentation and Information Management Specialist
    employer: Drs. Bruce and Lee Foundation
    place: Florence, SC, hybrid
    dates: Jan 2026 – Present
    bullets:
      - Designed and implemented a centralized SharePoint document management system for more than 30 years of organizational records.
      - Developed the information architecture, taxonomy, metadata, naming conventions, and organizational standards that turned a large, fragmented archive into a structured, searchable digital resource.
      - Audited, categorized, and organized historical records across physical and digital formats, establishing documentation workflows and standards to improve accessibility, retrieval, consistency, and long-term records management.
      - Edited and refined grant documentation and supporting materials.
  - title: Senior UX Writer
    employer: ACS Technologies
    place: Remote
    dates: Dec 2023 – Dec 2025
    bullets:
      - Led documentation and UX content strategy for multi-product cloud SaaS platforms, owning 100% of Help Center content for Go Method and Growth Method products.
      - Drove information architecture, article structure, and topic metadata across both product Help Centers, defining scalable content frameworks for long-term maintainability.
      - Wrote UX copy for onboarding flows, modals, tooltips, error states, and feature launches, contributing to improved task completion and user adoption.
      - Partnered with engineering, product, design, legal, and compliance teams to deliver accurate, user-centered content under tight Agile release cycles.
      - Used Pendo analytics and user behavior data to evaluate documentation effectiveness, iterating to improve clarity, engagement, and usability.
      - Spearheaded revamp of video production processes, implementing AI-based video tools (Videate) and training colleagues on new workflows.
      - Mentored cross-functional partners in UX writing and documentation best practices, establishing consistent content patterns and voice and tone standards.
      - Collaborated cross-functionally to develop onboarding documentation for a mission trip platform, significantly improving user experience and internal team workflows.
  - title: Junior UX Writer
    employer: ACS Technologies
    place: Remote
    dates: Aug 2021 – Dec 2023
    bullets:
      - Transitioned from technical writing into UX content, shaping in-product copy and documentation strategy for complex SaaS platforms.
      - Authored onboarding flows, modals, tooltips, and error states to reduce user friction and improve self-serve adoption.
      - Conducted workflow analysis to align content with user journeys and product goals across multiple product lines.
      - Collaborated with product, engineering, and design teams in Agile sprints to deliver clear, user-centered content at scale.
      - Performed regular content audits for accuracy, consistency, and alignment with evolving system behavior.
  - title: Technical Writer
    employer: ACS Technologies
    place: Florence, SC, remote
    dates: Jan 2019 – Aug 2021
    bullets:
      - Authored and maintained technical documentation for cloud-based SaaS products, including Help Center articles, integration guides, and feature-level content.
      - Led instructional video production using Camtasia, establishing production guidelines, creating video graphics and thumbnails, and training team members on video workflows.
      - Partnered with engineers and product managers to translate complex system behavior into accessible, structured documentation.
      - Maintained and versioned documentation across frequent product releases, ensuring content accuracy amid rapid development cycles.
  - title: Technical Writing Intern
    employer: ACS Technologies
    place: ""
    dates: Jul 2018 – Jan 2019
    bullets:
      - Supported documentation and video production for SaaS products during a hands-on internship that led directly to a full-time position.
      - Created instructional videos using Camtasia and assisted with Help Center content development.
      - Developed foundational skills in structured documentation, editorial processes, and cross-functional collaboration within a professional content team.
selectedProject:
  title: Integrating DocuSign with Go Method
  employer: ACS Technologies
  bullets:
    - Identified gap in customer self-service for DocuSign integration setup, which was driving support ticket volume and inconsistent adoption.
    - Collaborated with engineering and product SMEs to map the integration workflow, then authored a comprehensive step-by-step guide for administrators.
    - Reduced support inquiries, provided a scalable reference for internal teams, and established a reusable template for future integration documentation.
education:
  school: Francis Marion University
  place: Florence, SC
  dates: 2014 – 2018
  degree: Bachelor of Arts, Professional, Technical, Business & Scientific Writing
  achievements:
    - Assisting Editor, Snow Island Review Journal — reviewed, selected and edited literary submissions for the university's annual literary journal.
    - Peer Writing Tutor, English Department.
    - Student Government Association (SGA) Member.
```

- [ ] **Step 13: Create `src/lib/resume.ts`**

```ts
import { z } from 'astro/zod';
import raw from '../data/resume.yaml?raw';
import { parseYamlData } from './yaml-data';

const SkillGroup = z.object({
  name: z.string().min(1),
  items: z.array(z.string()).min(1),
});

const Job = z.object({
  title: z.string().min(1),
  employer: z.string().min(1),
  place: z.string(),
  dates: z.string().min(1),
  bullets: z.array(z.string()).min(1),
});

const Resume = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  skills: z.array(SkillGroup).min(1),
  experience: z.array(Job).min(1),
  selectedProject: z.object({
    title: z.string().min(1),
    employer: z.string().min(1),
    bullets: z.array(z.string()).min(1),
  }),
  education: z.object({
    school: z.string().min(1),
    place: z.string().min(1),
    dates: z.string().min(1),
    degree: z.string().min(1),
    achievements: z.array(z.string()).min(1),
  }),
});

export type SkillGroup = z.infer<typeof SkillGroup>;
export type Job = z.infer<typeof Job>;
export type Resume = z.infer<typeof Resume>;

export const resume: Resume = parseYamlData(raw, Resume, 'src/data/resume.yaml');
```

- [ ] **Step 14: Create `src/lib/images.ts`**

```ts
import type { ImageMetadata } from 'astro';

/**
 * Photos and work samples live at fixed paths and are referenced from YAML by their file name
 * without the extension, for example "headshot" or "email-1-preview". These maps make the typed
 * image modules available to pages, so Astro's <Image> can size and optimise them.
 */
const photoModules = import.meta.glob<ImageMetadata>('../assets/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});
const sampleModules = import.meta.glob<ImageMetadata>('../assets/samples/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

function byKey(modules: Record<string, ImageMetadata>, folder: string): Record<string, ImageMetadata> {
  const map: Record<string, ImageMetadata> = {};
  for (const [path, image] of Object.entries(modules)) {
    const name = path.split('/').pop()?.replace(/\.[^.]+$/, '');
    if (name) map[name] = image;
  }
  if (Object.keys(map).length === 0) throw new Error(`No images found in ${folder}`);
  return map;
}

const photos = byKey(photoModules, 'src/assets/photos');
const samples = byKey(sampleModules, 'src/assets/samples');

/** A photo from src/assets/photos/ by name, without the extension. */
export function photo(name: string): ImageMetadata {
  const image = photos[name];
  if (!image) throw new Error(`No photo "${name}" in src/assets/photos/`);
  return image;
}

/** A sample image from src/assets/samples/ by name, without the extension. */
export function sample(name: string): ImageMetadata {
  const image = samples[name];
  if (!image) throw new Error(`No sample image "${name}" in src/assets/samples/`);
  return image;
}
```

- [ ] **Step 15: Run it to see it pass**

Run: `npx vitest run tests/unit/data.test.ts`
Expected: `Tests  27 passed (27)`.

- [ ] **Step 16: Commit**

```bash
git add src/lib/yaml-data.ts src/data/site.yaml src/lib/site.ts src/data/work.yaml src/lib/work.ts src/data/quotes.yaml src/lib/quotes.ts src/data/about.yaml src/lib/about.ts src/data/resume.yaml src/lib/resume.ts src/lib/images.ts tests/unit/data.test.ts
git commit -m "Add her content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Phase 2: Look and components

### Task 3: Tokens and global styles

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

The "Sun & Surf" palette and type from spec section 4: sand, deep ocean, teal, turquoise, aqua, sun-gold and
coral; Fraunces for headings, Source Sans 3 for text. The pages exercise these styles; Task 7 onward checks them in
a browser.

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root {
  color-scheme: light;

  /* Palette: the "Sun & Surf" mockup and the spec's table. */
  --sand: #fbf3e6;
  --sand-2: #f6e8d2;
  --sand-3: #eedcbf;
  --paper: #fffcf4;
  --ink: #0b3b42;
  --ink-2: #2f5a5d;
  --ocean: #0d5c66;
  --deep: #08363d;
  --deepest: #062b31;
  --turquoise: #0b8b87;
  --turquoise-bright: #4ecdc0;
  --aqua: #e8f9f4;
  --aqua-2: #d6f1ea;
  --aqua-3: #c8eae2;
  --aqua-4: #9bdbd0;
  --aqua-5: #5fc4b8;
  --sun: #f6b23d;
  --sun-deep: #e79a24;
  --coral: #d2532e;
  --coral-ink: #b3401f;
  --rule: rgba(8, 54, 61, 0.14);

  /* Type. Fraunces for headings, Source Sans 3 for text; both self-hosted. */
  --serif: 'Fraunces Variable', 'Fraunces', Georgia, 'Times New Roman', serif;
  --sans: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --text-body: 17px;
  --text-small: 0.92rem;
  --text-label: 0.7rem;
  --text-lede: clamp(1.08rem, 1.35vw, 1.16rem);
  --display-1: clamp(2.9rem, 6vw, 5.15rem);
  --display-2: clamp(2.05rem, 3.8vw, 3rem);
  --display-3: clamp(1.3rem, 1.95vw, 1.6rem);

  /* Space. */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4.5rem;
  --section-y: clamp(50px, 7vw, 86px);

  /* Shape. */
  --radius-card: 22px;
  --radius-pill: 999px;
  --shadow-card: 0 30px 60px -34px rgba(8, 54, 61, 0.5);
  --max: 1160px;
  --gutter: 20px;
}
```

- [ ] **Step 2: Create `src/styles/global.css`**

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--sand);
  color: var(--ink);
  font-family: var(--sans);
  font-size: var(--text-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

main {
  /* Clear the 81px sticky header when the skip link jumps to the content. */
  scroll-margin-top: 96px;
}

img {
  display: block;
  max-width: 100%;
}

figure {
  margin: 0;
}

a {
  color: inherit;
}

p {
  margin: 0;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: var(--serif);
  font-weight: 600;
  font-optical-sizing: auto;
}

::selection {
  background: var(--sun);
  color: var(--deep);
}

:focus-visible {
  outline: 3px solid var(--turquoise);
  outline-offset: 3px;
  border-radius: 6px;
}

.btn-primary:focus-visible {
  outline-color: var(--deep);
}

.wrap {
  width: min(100% - (var(--gutter) * 2), var(--max));
  margin-inline: auto;
}

.section {
  scroll-margin-top: 104px;
}

.sr-only,
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* Skip link: the first focus stop on every page. */
.skip-link {
  position: absolute;
  left: 16px;
  top: -6rem;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  background: var(--deep);
  color: var(--sand);
  font-weight: 700;
  text-decoration: none;
}
.skip-link:focus {
  top: 12px;
  color: var(--sand);
}

/* Section headings with the small wave tick. */
.section-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: clamp(26px, 3.4vw, 40px);
}
.section-head h2 {
  font-size: var(--display-2);
  line-height: 1.02;
  letter-spacing: -0.03em;
  font-weight: 600;
}
.wtick {
  display: block;
  color: var(--turquoise);
  flex: none;
}

/* Buttons. */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 52px;
  padding: 14px 27px;
  border: 1.5px solid transparent;
  border-radius: var(--radius-pill);
  font-family: var(--sans);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.005em;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.btn-primary {
  background: var(--sun);
  color: var(--deep);
  box-shadow: 0 16px 28px -16px rgba(231, 154, 36, 0.95);
  border-color: rgba(8, 54, 61, 0.08);
}
.btn-primary:hover {
  background: #ffc45a;
  transform: translateY(-2px);
  box-shadow: 0 20px 32px -16px rgba(231, 154, 36, 1);
}
.btn-ghost {
  background: transparent;
  color: var(--ink);
  border-color: rgba(11, 59, 66, 0.35);
}
.btn-ghost:hover {
  border-color: var(--deep);
  background: rgba(11, 139, 135, 0.1);
  transform: translateY(-2px);
}
.btn-sm {
  min-height: 46px;
  padding: 10px 22px;
  font-size: 0.95rem;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Small caps label on cards and panels. */
.label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 6px 13px 6px 11px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(8, 54, 61, 0.09);
  font-size: var(--text-label);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--deep);
}
.label::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent, var(--turquoise));
  flex: none;
}

/* Underlined text links with an arrow. */
.read,
.panel-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  width: fit-content;
  color: var(--ocean);
  font-size: 0.93rem;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-style: solid;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 5px;
  text-decoration-color: rgba(13, 92, 102, 0.42);
  transition:
    color 0.18s ease,
    text-decoration-color 0.18s ease;
}
.read .arrow,
.panel-link .arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}
.read:hover,
.panel-link:hover {
  color: var(--deep);
  text-decoration-color: var(--turquoise);
}
.read:hover .arrow,
.panel-link:hover .arrow {
  transform: translateX(4px);
}

/* Full-width wave dividers between page bands. */
.wave-block {
  display: block;
  width: 100%;
  height: clamp(40px, 5.4vw, 72px);
  line-height: 0;
}
.wave-block svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Long-form work-page text. */
.prose {
  display: grid;
  gap: clamp(28px, 3.4vw, 40px);
  max-width: 46rem;
}
.prose section {
  display: grid;
  gap: 12px;
}
.prose h2 {
  font-size: clamp(1.5rem, 2.4vw, 1.95rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.prose p {
  max-width: 42rem;
  color: var(--ink-2);
  text-wrap: pretty;
}
.prose ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 1.1em;
  color: var(--ink-2);
}
.prose a {
  color: var(--ocean);
  font-weight: 600;
  text-decoration-color: rgba(13, 92, 102, 0.42);
  text-underline-offset: 3px;
}
.prose a:hover {
  color: var(--deep);
  text-decoration-color: var(--turquoise);
}

@media (max-width: 720px) {
  main {
    /* The header is static at this width, so there is nothing to scroll clear of. */
    scroll-margin-top: 0;
  }
}

@media (max-width: 520px) {
  :root {
    --gutter: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css
git commit -m "Add the design tokens and global styles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 4: Wave mark, button, header, footer and layout

**Files:**
- Create: `src/components/WaveMark.astro`, `public/favicon.svg`, `src/components/Button.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/layouts/BaseLayout.astro`
- Test: `tests/unit/chrome.test.ts`

The tests render the components with Astro's container API. `BaseLayout` is covered from Task 7 on, when the page
tests render every page in a browser.

- [ ] **Step 1: Create `tests/unit/chrome.test.ts`** (the failing test)

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Button from '../../src/components/Button.astro';
import SiteFooter from '../../src/components/SiteFooter.astro';
import SiteHeader from '../../src/components/SiteHeader.astro';
import WaveMark from '../../src/components/WaveMark.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('SiteHeader', () => {
  it('links Work, About and Resume in order, and the home page from her name', async () => {
    const html = await container.renderToString(SiteHeader, { request: new Request('https://heyhannah.xyz/') });
    const hrefs = [...html.matchAll(/<nav[^>]*>([\s\S]*?)<\/nav>/g)].flatMap((m) =>
      [...m[1].matchAll(/href="([^"]+)"/g)].map((h) => h[1]),
    );
    expect(hrefs).toEqual(['/work/', '/about/', '/resume/']);
    expect(html).toMatch(/<a class="brand"[^>]*href="\/"[^>]*aria-label="Hannah Bailey, home"/);
  });

  it('marks the current section, including on a work page', async () => {
    const html = await container.renderToString(SiteHeader, {
      request: new Request('https://heyhannah.xyz/work/microcopy/'),
    });
    expect(html).toMatch(/href="\/work\/" aria-current="page"/);
    expect(html).not.toMatch(/href="\/about\/" aria-current/);
  });

  it('offers "Email me" to her address', async () => {
    const html = await container.renderToString(SiteHeader, { request: new Request('https://heyhannah.xyz/') });
    expect(html).toMatch(/href="mailto:baileyhannah995@gmail\.com"[^>]*>Email me</);
  });
});

describe('SiteFooter', () => {
  it('names her and the site, and links her email and LinkedIn', async () => {
    const html = await container.renderToString(SiteFooter);
    expect(html).toContain('© 2026 Hannah Bailey · heyhannah.xyz');
    expect(html).toContain('href="mailto:baileyhannah995@gmail.com"');
    expect(html).toContain('href="https://www.linkedin.com/in/hannah-bailey-hb2023/"');
  });
});

describe('Button', () => {
  it('renders a link with its variant and size', async () => {
    const html = await container.renderToString(Button, {
      props: { href: '/work/', variant: 'ghost', size: 'small' },
      slots: { default: 'See my work' },
    });
    expect(html).toMatch(/<a class="btn btn-ghost btn-sm"[^>]*href="\/work\/"[^>]*>See my work<\/a>/);
  });
});

describe('WaveMark', () => {
  it('is decorative and sized', async () => {
    const html = await container.renderToString(WaveMark, { props: { width: 22, height: 14 } });
    expect(html).toMatch(/<svg[^>]*width="22"[^>]*height="14"[^>]*aria-hidden="true"/);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/unit/chrome.test.ts`
Expected: FAIL, because the components do not exist yet.

- [ ] **Step 3: Create `src/components/WaveMark.astro`**

```astro
---
interface Props {
  width?: number;
  height?: number;
}
const { width = 27, height = 19 } = Astro.props;
---
<svg
  class="wave-mark"
  width={width}
  height={height}
  viewBox="0 0 27 19"
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <path
    d="M1 12c2.7-4.8 5.4-4.8 8.1 0s5.4 4.8 8.1 0 5.4-4.8 8.1 0"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"></path>
  <path
    d="M2.7 5.6c2.1-3.6 4.2-3.6 6.3 0s4.2 3.6 6.3 0 4.2-3.6 6.3 0"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    opacity=".5"></path>
</svg>
```

- [ ] **Step 4: Create `public/favicon.svg`** (the same mark, standalone)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#08363d"/>
  <path d="M3 20.5c3.2-5.2 6.5-5.2 9.7 0s6.5 5.2 9.7 0 4.9-3.9 6.6-3" fill="none" stroke="#4ecdc0" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M5 13.5c2.6-4.2 5.2-4.2 7.8 0s5.2 4.2 7.8 0 4.2-3.2 6-2.4" fill="none" stroke="#f6b23d" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>
</svg>
```

- [ ] **Step 5: Create `src/components/Button.astro`**

```astro
---
interface Props {
  href: string;
  /** primary: sun-gold; ghost: outlined on sand. */
  variant?: 'primary' | 'ghost';
  size?: 'normal' | 'small';
}
const { href, variant = 'primary', size = 'normal' } = Astro.props;
---
<a class:list={['btn', `btn-${variant}`, { 'btn-sm': size === 'small' }]} href={href}><slot /></a>
```

- [ ] **Step 6: Create `src/components/SiteHeader.astro`**

```astro
---
import { site } from '../lib/site';
import Button from './Button.astro';
import WaveMark from './WaveMark.astro';

const links = [
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/resume/', label: 'Resume' },
];
const path = Astro.url.pathname;
---
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label={`${site.name}, home`}>
      <WaveMark width={27} height={19} />
      {site.name}
    </a>
    <nav class="nav" aria-label="Main">
      {
        links.map((link) => (
          <a
            href={link.href}
            aria-current={path === link.href || path.startsWith(link.href) ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))
      }
    </nav>
    <div class="header-cta"><Button href={`mailto:${site.email}`} size="small">Email me</Button></div>
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(251, 243, 230, 0.9);
    -webkit-backdrop-filter: saturate(180%) blur(14px);
    backdrop-filter: saturate(180%) blur(14px);
    border-bottom: 1px solid var(--rule);
  }
  .site-header::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--turquoise) 0%,
      var(--turquoise-bright) 34%,
      var(--sun) 68%,
      var(--coral) 100%
    );
  }
  .header-inner {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 80px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    margin-right: auto;
    padding: 12px 0;
    font-family: var(--serif);
    font-size: 1.38rem;
    font-weight: 600;
    letter-spacing: -0.018em;
    text-decoration: none;
    color: var(--ink);
  }
  .brand :global(.wave-mark) {
    color: var(--turquoise);
  }
  .nav {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 10px 15px;
    border-radius: var(--radius-pill);
    color: var(--ink-2);
    font-weight: 600;
    font-size: 0.98rem;
    text-decoration: none;
    transition:
      color 0.18s ease,
      background 0.18s ease;
  }
  .nav a:hover {
    color: var(--deep);
    background: rgba(11, 139, 135, 0.1);
  }
  .nav a[aria-current='page'] {
    color: var(--deep);
    background: rgba(11, 139, 135, 0.13);
  }
  .header-cta {
    margin-left: 16px;
  }

  @media (max-width: 720px) {
    .site-header {
      position: static;
    }
    .nav {
      order: 3;
      width: 100%;
      justify-content: flex-start;
      gap: 0;
      border-top: 1px solid var(--rule);
      padding: 4px 0;
    }
    .nav a {
      padding: 10px 14px 10px 0;
      margin-right: 12px;
    }
    .header-cta {
      margin-left: auto;
    }
    .header-inner {
      padding-bottom: 2px;
    }
  }
  @media (max-width: 520px) {
    .brand {
      font-size: 1.24rem;
    }
  }
</style>
```

- [ ] **Step 7: Create `src/components/SiteFooter.astro`**

```astro
---
import { site } from '../lib/site';
import WaveMark from './WaveMark.astro';
---
<footer class="site-footer">
  <div class="wrap footer-inner">
    <p class="footer-mark">
      <WaveMark width={22} height={14} />
      <span>© 2026 {site.name} · heyhannah.xyz</span>
    </p>
    <p class="footer-links">
      <a href={`mailto:${site.email}`}>{site.email}</a>
      <span class="sep" aria-hidden="true">·</span>
      <a href={site.linkedin}>LinkedIn</a>
    </p>
  </div>
</footer>

<style>
  .site-footer {
    padding: 20px 0 28px;
  }
  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 4px 18px;
  }
  .footer-mark {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 0.86rem;
    color: var(--ink-2);
  }
  .footer-mark :global(.wave-mark) {
    color: var(--turquoise);
    flex: none;
  }
  .footer-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 8px;
    font-size: 0.86rem;
    color: var(--ink-2);
  }
  .footer-links a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--ocean);
    font-weight: 600;
    text-decoration-color: rgba(13, 92, 102, 0.42);
    text-underline-offset: 3px;
  }
  .footer-links a:hover {
    color: var(--deep);
    text-decoration-color: var(--turquoise);
  }
  .sep {
    color: var(--ink-2);
  }
</style>
```

- [ ] **Step 8: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/fraunces/standard.css';
import '@fontsource-variable/fraunces/standard-italic.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-sans-3/latin-700.css';
import '../styles/global.css';
import SiteFooter from '../components/SiteFooter.astro';
import SiteHeader from '../components/SiteHeader.astro';
import { site } from '../lib/site';

interface Props {
  /** The full page title, for example "Work · Hannah Bailey". */
  title: string;
  description: string;
}
const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, site.url).href;
const image = new URL('/og.png', site.url).href;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title}</title>
    <meta name="description" content={description}>
    <meta name="color-scheme" content="light">
    <link rel="canonical" href={canonical}>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="sitemap" href="/sitemap-index.xml">
    <meta name="theme-color" content="#fbf3e6">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content={site.name}>
    <meta property="og:title" content={title}>
    <meta property="og:description" content={description}>
    <meta property="og:url" content={canonical}>
    <meta property="og:image" content={image}>
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Hannah Bailey, technical writer, UX writer and content designer">
    <meta name="twitter:card" content="summary_large_image">
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

- [ ] **Step 9: Run it to see it pass**

Run: `npx vitest run tests/unit/chrome.test.ts && npx astro check`
Expected: `Tests  6 passed (6)`, then `- 0 errors` from the type check.

- [ ] **Step 10: Commit**

```bash
git add src/components/WaveMark.astro public/favicon.svg src/components/Button.astro src/components/SiteHeader.astro src/components/SiteFooter.astro src/layouts/BaseLayout.astro tests/unit/chrome.test.ts
git commit -m "Add the wave mark, header, footer and base layout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 5: Section components

**Files:**
- Create: `src/components/WaveDivider.astro`, `src/components/ProofStrip.astro`, `src/components/WorkCard.astro`, `src/components/Quote.astro`, `src/components/PhotoPanel.astro`, `src/components/WorkPageShell.astro`
- Test: `tests/unit/sections.test.ts`

The test strips Astro's scoped-style attributes (`data-astro-cid-…`) before matching, so it reads like the markup.
A work card's title link stretches over the whole card, so a click anywhere on it opens the work page; its
accessible name is "Read more about <title>". `WorkPageShell` puts the hero copy, the body and the next/back links
in one centered column.

- [ ] **Step 1: Create `tests/unit/sections.test.ts`** (the failing test)

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import PhotoPanel from '../../src/components/PhotoPanel.astro';
import ProofStrip from '../../src/components/ProofStrip.astro';
import Quote from '../../src/components/Quote.astro';
import WaveDivider from '../../src/components/WaveDivider.astro';
import WorkCard from '../../src/components/WorkCard.astro';
import WorkPageShell from '../../src/components/WorkPageShell.astro';
import { photo } from '../../src/lib/images';
import { quote } from '../../src/lib/quotes';
import { workPage } from '../../src/lib/work';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

/** Renders a component without Astro's scoped-style attributes, so the tests read like the markup. */
async function render(...args: Parameters<AstroContainer['renderToString']>): Promise<string> {
  const html = await container.renderToString(...args);
  return html.replace(/ data-astro-cid-[\w-]+(?:="[^"]*")?/g, '');
}

describe('WorkCard', () => {
  it('links its title to the work page, with a name that says where it goes', async () => {
    const html = await render(WorkCard, { props: { page: workPage('microcopy'), accent: 3 } });
    expect(html).toContain('class="card card-3"');
    expect(html).toContain('<p class="label">UX writing</p>');
    expect(html).toMatch(
      /<h3 class="card-title"><a href="\/work\/microcopy\/" aria-label="Read more about Microcopy across multiple products">/,
    );
  });

  it('can use an h2 for the full work list', async () => {
    const html = await render(WorkCard, { props: { page: workPage('video'), level: 'h2' } });
    expect(html).toMatch(/<h2 class="card-title">/);
  });
});

describe('ProofStrip', () => {
  it('shows each figure with its unit and caption, under an accessible name', async () => {
    const html = await render(ProofStrip, {
      props: { figures: [{ figure: '7+', unit: 'years', caption: 'writing for SaaS products' }] },
    });
    expect(html).toContain('aria-label="At a glance"');
    expect(html).toMatch(/7\+\s*<span class="unit">years<\/span>/);
    expect(html).toContain('<p>— writing for SaaS products</p>');
  });
});

describe('Quote', () => {
  it('sets the highlight in the accent colour and names the person', async () => {
    const html = await render(Quote, {
      props: { quote: quote('barbara-green-home'), highlight: 'truly helps users succeed' },
    });
    expect(html).toContain('<span class="quote-mark">truly helps users succeed</span>');
    expect(html).toContain('— Barbara Green, UX Content Strategy &amp; Operations');
    expect(html).not.toContain('managed Hannah directly');
  });

  it('adds the relationship when asked', async () => {
    const html = await render(Quote, {
      props: { quote: quote('barbara-green-home'), tone: 'plain', showRelationship: true },
    });
    expect(html).toContain('quote--plain');
    expect(html).toContain(', managed Hannah directly at ACS Technologies');
  });
});

describe('WorkPageShell', () => {
  it('gives the page its one h1, its live examples and the next and back links', async () => {
    const html = await render(WorkPageShell, {
      props: {
        label: 'Case study',
        title: 'A title',
        lede: 'A lede.',
        links: [{ label: 'The guide', href: 'https://example.com/guide' }],
        next: { label: 'The next page', href: '/work/next/' },
      },
      slots: { default: '<p>Body</p>' },
    });
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('<h2 id="live-examples">Live examples</h2>');
    expect(html).toMatch(/<a class="work-next" href="\/work\/next\/">\s*Next: The next page/);
    expect(html).toMatch(/<a class="work-back" href="\/work\/">Back to all work<\/a>/);
  });

  it('leaves out the live examples when there are none', async () => {
    const html = await render(WorkPageShell, {
      props: { label: 'Video', title: 'A title', lede: 'A lede.' },
    });
    expect(html).not.toContain('Live examples');
  });
});

describe('PhotoPanel', () => {
  const panel = { image: photo('race'), alt: 'Two motorcycles in a corner', width: 600, height: 400 };

  it('shows the photo with its alt text, the title, the line and the link', async () => {
    const html = await render(PhotoPanel, {
      props: {
        ...panel,
        title: 'Motorsports photography',
        description: 'Fast subjects.',
        link: { href: 'https://umbra.smugmug.com', label: 'See Umbra Photography' },
      },
    });
    expect(html).toMatch(/<img[^>]*alt="Two motorcycles in a corner"[^>]*width="600"[^>]*height="400"/);
    expect(html).toContain('<h3>Motorsports photography</h3>');
    expect(html).toContain('<p>Fast subjects.</p>');
    expect(html).toMatch(/<a class="panel-link" href="https:\/\/umbra\.smugmug\.com">\s*See Umbra Photography/);
  });

  it('leaves out the link when there is none', async () => {
    const html = await render(PhotoPanel, { props: { ...panel, title: 'Kitten fostering', description: 'Kittens.' } });
    expect(html).not.toContain('panel-link');
  });
});

describe('WaveDivider', () => {
  it('is decorative and fills with the colour it is given', async () => {
    const html = await render(WaveDivider, { props: { color: '#08363d', variant: 'out' } });
    expect(html).toMatch(/<div class="wave-block"[^>]*aria-hidden="true"/);
    expect(html).toContain('fill="#08363d"');
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/unit/sections.test.ts`
Expected: FAIL, because the components do not exist yet.

- [ ] **Step 3: Create `src/components/WaveDivider.astro`**

```astro
---
interface Props {
  /** The colour of the band the waves lead into (variant "in") or out of (variant "out"). */
  color: string;
  /**
   * "in": waves rise at the foot of the divider, into a dark band below.
   * "out": the dark band above ends in a wave that returns to sand.
   */
  variant?: 'in' | 'out';
}
const { color, variant = 'in' } = Astro.props;
---
{
  variant === 'in' ? (
    <div class="wave-block" aria-hidden="true">
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none" focusable="false">
        <path
          fill={color}
          opacity=".55"
          d="M0 46c96-26 192 4 288 12s192-24 288-30 192 28 288 32 192-24 288-28 192 8 288 4v36H0z"
        />
        <path fill={color} d="M0 52c96-22 192 6 288 14s192-26 288-32 192 30 288 34 192-26 288-30 192 10 288 6v28H0z" />
      </svg>
    </div>
  ) : (
    <div class="wave-block" aria-hidden="true">
      <svg viewBox="0 0 1440 72" preserveAspectRatio="none" focusable="false">
        <path fill={color} d="M0 0h1440v16c-96 18-192-4-288 0s-192 28-288 24-192-32-288-30S192 36 96 28 48 12 0 20z" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ProofStrip.astro`**

```astro
---
interface Figure {
  /** The big number, for example "7+" or "100%". */
  figure: string;
  /** A small word after the number, for example "years". */
  unit?: string;
  caption: string;
}
interface Props {
  figures: Figure[];
  /** The accessible name of the strip. */
  label?: string;
}
const { figures, label = 'At a glance' } = Astro.props;
---
<section class="proof" aria-label={label}>
  <div class="wrap">
    <div class="proof-inner">
      {
        figures.map((item) => (
          <div class="proof-item">
            <div class="n">
              {item.figure}
              {item.unit && <span class="unit">{item.unit}</span>}
            </div>
            <p>— {item.caption}</p>
          </div>
        ))
      }
    </div>
  </div>
</section>

<style>
  .proof {
    padding: clamp(8px, 1.6vw, 18px) 0 clamp(20px, 3vw, 30px);
  }
  .proof-inner {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: linear-gradient(125deg, #f0fbf7 0%, #e4f8f2 55%, #d9f3ec 100%);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 26px;
    padding: clamp(26px, 3.2vw, 38px) clamp(6px, 2vw, 14px);
    box-shadow: 0 32px 58px -46px rgba(8, 54, 61, 0.6);
  }
  .proof-inner::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 6px;
    background: linear-gradient(90deg, var(--turquoise) 0%, var(--turquoise-bright) 42%, var(--sun) 100%);
    opacity: 0.9;
  }
  .proof-item {
    padding: 2px clamp(12px, 2vw, 26px);
  }
  .proof-item + .proof-item {
    border-left: 1px solid rgba(8, 54, 61, 0.13);
  }
  .n {
    font-family: var(--serif);
    font-weight: 700;
    font-size: clamp(2.1rem, 3.7vw, 3.05rem);
    line-height: 0.92;
    letter-spacing: -0.04em;
    color: var(--turquoise);
  }
  .unit {
    font-family: var(--sans);
    font-size: 0.4em;
    font-weight: 700;
    letter-spacing: 0;
    color: var(--ink-2);
    margin-left: 0.12em;
  }
  .proof-item p {
    margin-top: 12px;
    font-size: 0.88rem;
    line-height: 1.42;
    color: var(--ink-2);
    text-wrap: pretty;
  }

  @media (max-width: 900px) {
    .proof-inner {
      grid-template-columns: 1fr 1fr;
      row-gap: 24px;
      padding: 26px 8px;
    }
    .proof-item {
      padding: 0 22px;
    }
    .proof-item + .proof-item {
      border-left: 0;
    }
    .proof-item:nth-child(even) {
      border-left: 1px solid rgba(8, 54, 61, 0.13);
    }
    .proof-item:nth-child(n + 3) {
      border-top: 1px solid rgba(8, 54, 61, 0.13);
      padding-top: 22px;
    }
  }
  @media (max-width: 520px) {
    .n {
      font-size: 1.95rem;
    }
    .proof-item p {
      font-size: 0.9rem;
    }
  }
</style>
```

- [ ] **Step 5: Create `src/components/WorkCard.astro`**

```astro
---
import type { WorkPage } from '../lib/work';
import { workHref } from '../lib/work';

interface Props {
  page: WorkPage;
  /** Which wave-top accent to use: 1 turquoise, 2 teal, 3 gold, 4 coral. */
  accent?: 1 | 2 | 3 | 4;
  /** The card's heading level: h3 in the home page grid, h2 in the full work list. */
  level?: 'h2' | 'h3';
}
const { page, accent = 1, level = 'h3' } = Astro.props;
const Heading = level;
---
<article class={`card card-${accent}`}>
  <svg class="card-wave" viewBox="0 0 600 44" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path class="back" d="M0 0h600v28c-75 14-150-10-225-2s-150 18-225 10S75 36 0 28z"></path>
    <path class="front" d="M0 0h600v12c-75 20-150-6-225 2s-150 18-225 10S75 20 0 14z"></path>
  </svg>
  <p class="label">{page.label}</p>
  <Heading class="card-title">
    <a href={workHref(page.slug)} aria-label={`Read more about ${page.title}`}>
      {page.title}
    </a>
  </Heading>
  <p class="card-summary">{page.summary}</p>
  <span class="read" aria-hidden="true">
    Read more <span class="arrow">→</span>
  </span>
</article>

<style>
  .card {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: clamp(24px, 3vw, 34px);
    padding-top: calc(clamp(24px, 3vw, 34px) + 22px);
    background: linear-gradient(180deg, #e9faf5 0%, #f4fcf9 60%, #fbfefc 100%);
    border: 1px solid rgba(8, 54, 61, 0.1);
    border-radius: var(--radius-card);
    transition:
      transform 0.22s ease,
      box-shadow 0.22s ease,
      border-color 0.22s ease;
  }
  .card-1 {
    --accent: #18a79f;
  }
  .card-2 {
    --accent: #0d7f8a;
  }
  .card-3 {
    --accent: #ef9c22;
  }
  .card-4 {
    --accent: #dd5f3f;
  }
  .card-wave {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    width: 100%;
    height: 44px;
    pointer-events: none;
  }
  .card-wave path {
    fill: var(--accent);
  }
  .card-wave .back {
    opacity: 0.2;
  }
  .card-wave .front {
    opacity: 0.7;
  }
  .card:hover {
    transform: translateY(-4px);
    border-color: rgba(8, 54, 61, 0.16);
    box-shadow: 0 34px 48px -38px rgba(8, 54, 61, 0.7);
  }
  /* The mockup renders the label at body size because its `.card p` rule wins over `.label`. */
  .card .label {
    margin-top: 12px;
    font-size: 1rem;
  }
  .card-title a {
    color: inherit;
    text-decoration: none;
  }
  /* Stretch the title link over the whole card, so the title and body are clickable too. */
  .card-title a::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-card);
  }
  .card-title {
    margin-top: 16px;
    font-size: var(--display-3);
    line-height: 1.16;
    letter-spacing: -0.02em;
    font-weight: 600;
    max-width: 30ch;
    text-wrap: balance;
    color: var(--ink);
  }
  .card-summary {
    margin-top: 12px;
    max-width: 60ch;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .read {
    margin-top: auto;
    padding-top: 24px;
  }
</style>
```

- [ ] **Step 6: Create `src/components/Quote.astro`**

```astro
---
import type { Quote as QuoteData } from '../lib/quotes';

interface Props {
  quote: QuoteData;
  /** "band" sits on the deep-ocean quote band; "plain" sits on sand in a grid of kind words. */
  tone?: 'band' | 'plain';
  /** Show the relationship too, for example ", managed Hannah directly at ACS Technologies". */
  showRelationship?: boolean;
  /** A phrase inside the quote to set in the accent colour. */
  highlight?: string;
}
const { quote, tone = 'band', showRelationship = false, highlight } = Astro.props;
const split = highlight && quote.text.includes(highlight) ? highlight : undefined;
const before = split ? quote.text.slice(0, quote.text.indexOf(split)) : '';
const after = split ? quote.text.slice(quote.text.indexOf(split) + split.length) : '';
---
<figure class:list={['quote', `quote--${tone}`]}>
  {
    tone === 'band' && (
      <svg class="qtick" width="46" height="14" viewBox="0 0 46 14" fill="none" aria-hidden="true" focusable="false">
        <path d="M1 9c5-7 10-7 15 0s10 7 15 0 8-5.2 14-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    )
  }
  <blockquote>
    <p>
      {
        split ? (
          <>
            &ldquo;{before}
            <span class="quote-mark">{split}</span>
            {after}&rdquo;
          </>
        ) : (
          <>&ldquo;{quote.text}&rdquo;</>
        )
      }
    </p>
  </blockquote>
  <figcaption>
    — {quote.name}, {quote.role}{showRelationship && `, ${quote.relationship}`}
  </figcaption>
</figure>

<style>
  .quote blockquote {
    margin: 0;
    position: relative;
  }
  .quote blockquote p {
    position: relative;
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.55rem, 3.1vw, 2.4rem);
    line-height: 1.3;
    letter-spacing: -0.018em;
    max-width: 30ch;
    text-wrap: pretty;
  }
  .quote figcaption {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-top: clamp(24px, 3vw, 34px);
    font-size: 0.9rem;
    line-height: 1.5;
    max-width: 52ch;
  }

  .quote--band {
    color: var(--sand);
  }
  .quote--band .qtick {
    color: var(--sun);
    margin-bottom: clamp(20px, 2.6vw, 28px);
  }
  .quote--band .quote-mark {
    color: #8fe0d6;
  }
  .quote--band figcaption {
    color: #b8d6d2;
  }

  .quote--plain {
    color: var(--ink);
  }
  .quote--plain blockquote p {
    font-size: clamp(1.2rem, 2vw, 1.5rem);
  }
  .quote--plain .quote-mark {
    color: var(--coral-ink);
    font-style: italic;
  }
  .quote--plain figcaption {
    color: var(--ink-2);
    margin-top: 16px;
  }
</style>
```

- [ ] **Step 7: Create `src/components/PhotoPanel.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  image: ImageMetadata;
  alt: string;
  title: string;
  description: string;
  /** An optional link below the text. */
  link?: { href: string; label: string };
  /** Which part of the photo to keep in the crop. */
  focus?: 'center' | 'low' | 'high';
  /** The image's intrinsic size, used to reserve space. */
  width: number;
  height: number;
}
const { image, alt, title, description, link, focus = 'center', width, height } = Astro.props;
---
<article class="panel">
  <div class="panel-ph">
    <Image class:list={['panel-img', `focus-${focus}`]} src={image} alt={alt} width={width} height={height} />
  </div>
  <div class="panel-body">
    <h3>{title}</h3>
    <p>{description}</p>
    {
      link && (
        <a class="panel-link" href={link.href}>
          {link.label} <span class="arrow" aria-hidden="true">→</span>
        </a>
      )
    }
  </div>
</article>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: var(--radius-card);
    box-shadow: 0 26px 46px -44px rgba(8, 54, 61, 0.55);
  }
  .panel-ph {
    aspect-ratio: 5 / 4;
    overflow: hidden;
    background: var(--sand-3);
  }
  .panel-ph :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .panel-ph :global(.focus-low) {
    object-position: 50% 60%;
  }
  .panel-ph :global(.focus-high) {
    object-position: 50% 30%;
  }
  .panel:hover .panel-ph :global(img) {
    transform: scale(1.04);
  }
  .panel-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: clamp(20px, 2.6vw, 28px);
  }
  .panel-body h3 {
    font-size: 1.4rem;
    line-height: 1.18;
    letter-spacing: -0.018em;
    font-weight: 600;
  }
  .panel-body p {
    margin-top: 10px;
    max-width: 44ch;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .panel-link {
    margin-top: 18px;
    padding-top: 2px;
  }
</style>
```

- [ ] **Step 8: Create `src/components/WorkPageShell.astro`**

```astro
---
interface Props {
  /** The small label above the heading, for example "Case study". */
  label: string;
  /** The page's only h1. */
  title: string;
  lede: string;
  /** The "Live examples" list; omitted when the body already lists the examples. */
  links?: { label: string; href: string }[];
  /** The next work page, for the foot-of-page link. */
  next?: { label: string; href: string };
  backHref?: string;
  backLabel?: string;
}
const { label, title, lede, links = [], next, backHref = '/work/', backLabel = 'Back to all work' } = Astro.props;
---
<section class="work-hero" aria-labelledby="work-title">
  <div class="wrap">
    <p class="work-label">{label}</p>
    <h1 id="work-title">{title}</h1>
    <p class="lede">{lede}</p>
  </div>
</section>

<div class="wrap work-body">
  <div class="prose">
    <slot />
  </div>

  {
    links.length > 0 && (
      <section class="work-links" aria-labelledby="live-examples">
        <h2 id="live-examples">Live examples</h2>
        <ul>
          {links.map((link) => (
            <li>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  <nav class="work-nav" aria-label="Work pages">
    {next && (
      <a class="work-next" href={next.href}>
        Next: {next.label} <span aria-hidden="true">→</span>
      </a>
    )}
    <a class="work-back" href={backHref}>{backLabel}</a>
  </nav>
</div>

<style>
  .work-hero {
    position: relative;
    padding: clamp(44px, 5.6vw, 76px) 0 clamp(30px, 4vw, 46px);
    background:
      radial-gradient(52% 60% at 84% 6%, rgba(246, 178, 61, 0.28) 0%, rgba(246, 178, 61, 0) 70%),
      linear-gradient(180deg, #fffaef 0%, #fdf4e4 46%, #eefaf5 100%);
  }
  /* Keep the hero copy and the body in the same centred reading column. */
  .work-hero .wrap {
    max-width: 46rem;
  }
  .work-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding: 9px 15px 9px 12px;
    border-radius: var(--radius-pill);
    background: rgba(11, 139, 135, 0.11);
    border: 1px solid rgba(11, 139, 135, 0.22);
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--deep);
  }
  h1 {
    font-size: clamp(2.4rem, 4.8vw, 4rem);
    line-height: 1.02;
    letter-spacing: -0.032em;
    font-weight: 700;
    max-width: 20ch;
    text-wrap: balance;
  }
  .lede {
    margin-top: clamp(18px, 2.4vw, 26px);
    max-width: 40rem;
    font-size: var(--text-lede);
    line-height: 1.62;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .work-body {
    display: grid;
    gap: clamp(36px, 5vw, 56px);
    max-width: 46rem;
    padding-block: clamp(40px, 5vw, 62px);
  }
  .work-links {
    max-width: 46rem;
    padding: clamp(22px, 3vw, 30px) clamp(22px, 3vw, 32px);
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: var(--radius-card);
    box-shadow: 0 26px 46px -44px rgba(8, 54, 61, 0.55);
  }
  .work-links h2 {
    font-size: clamp(1.4rem, 2.2vw, 1.75rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
  .work-links ul {
    display: grid;
    gap: 2px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
  }
  .work-links a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--ocean);
    font-weight: 600;
    text-decoration-color: rgba(13, 92, 102, 0.42);
    text-underline-offset: 4px;
  }
  .work-links a:hover {
    color: var(--deep);
    text-decoration-color: var(--turquoise);
  }
  .work-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px 24px;
    padding-top: clamp(22px, 3vw, 30px);
    border-top: 1px solid var(--rule);
  }
  .work-nav a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 11px 20px;
    border-radius: var(--radius-pill);
    font-weight: 700;
    text-decoration: none;
  }
  .work-next {
    background: var(--deep);
    color: var(--sand);
  }
  .work-next:hover {
    background: var(--ocean);
    color: var(--sand);
  }
  .work-back {
    color: var(--ocean);
    border: 1.5px solid rgba(11, 59, 66, 0.35);
  }
  .work-back:hover {
    color: var(--deep);
    border-color: var(--deep);
    background: rgba(11, 139, 135, 0.1);
  }
</style>
```

- [ ] **Step 9: Run it to see it pass**

Run: `npx vitest run tests/unit/sections.test.ts && npx astro check`
Expected: `Tests  10 passed (10)`, then `- 0 errors` from the type check.

- [ ] **Step 10: Commit**

```bash
git add src/components/WaveDivider.astro src/components/ProofStrip.astro src/components/WorkCard.astro src/components/Quote.astro src/components/PhotoPanel.astro src/components/WorkPageShell.astro tests/unit/sections.test.ts
git commit -m "Add the section components

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Phase 3: Pages

### Task 6: Local server and Playwright

**Files:**
- Create: `scripts/lib/serve.mjs`, `scripts/lib/serve.d.mts`, `scripts/serve.mjs`, `playwright.config.ts`
- Test: `tests/unit/serve.test.ts`

The server copies GitHub Pages: a directory serves its `index.html`, and a missing path gets `404.html` with
status 404. Playwright starts it on port 4321. `serve.d.mts` lets `astro check` type the test's import.

- [ ] **Step 1: Create `tests/unit/serve.test.ts`** (the failing test)

```ts
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serveDir } from '../../scripts/lib/serve.mjs';

let root = '';
let server: { url: string; close: () => Promise<void> };

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'serve-'));
  await writeFile(join(root, 'index.html'), '<h1>home</h1>');
  await writeFile(join(root, '404.html'), '<h1>off track</h1>');
  await mkdir(join(root, 'work'));
  await writeFile(join(root, 'work', 'index.html'), '<h1>work</h1>');
  await writeFile(join(root, 'font.woff2'), 'wOF2');
  server = await serveDir(root);
});

afterAll(async () => {
  await server.close();
  await rm(root, { recursive: true, force: true });
});

describe('serveDir', () => {
  it('serves index.html for the root and for directories', async () => {
    const home = await fetch(`${server.url}/`);
    expect(home.status).toBe(200);
    expect(home.headers.get('content-type')).toContain('text/html');
    expect(await home.text()).toBe('<h1>home</h1>');
    expect(await (await fetch(`${server.url}/work/`)).text()).toBe('<h1>work</h1>');
  });

  it('sends the right type for a font', async () => {
    const font = await fetch(`${server.url}/font.woff2`);
    expect(font.headers.get('content-type')).toBe('font/woff2');
  });

  it('answers a missing path with 404.html and status 404', async () => {
    const missing = await fetch(`${server.url}/nope/`);
    expect(missing.status).toBe(404);
    expect(await missing.text()).toBe('<h1>off track</h1>');
  });

  it('answers a malformed percent-encoded path with 400 and stays up', async () => {
    const malformed = await fetch(`${server.url}/%`);
    expect(malformed.status).toBe(400);
    const followUp = await fetch(`${server.url}/`);
    expect(followUp.status).toBe(200);
  });

  it('refuses paths outside the root', async () => {
    const escape = await fetch(`${server.url}/%2e%2e%2f%2e%2e%2fetc%2fpasswd`);
    expect(escape.status).toBe(403);
    expect(await escape.text()).not.toContain('root:');
  });

  it('resolves encoded dot segments that stay inside the root', async () => {
    const inside = await fetch(`${server.url}/%2e%2e/%2e%2e/etc/passwd`);
    expect(inside.status).toBe(404);
    expect(await inside.text()).not.toContain('root:');
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/unit/serve.test.ts`
Expected: FAIL, because `scripts/lib/serve.mjs` does not exist yet.

- [ ] **Step 3: Create `scripts/lib/serve.mjs`**

```js
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

/**
 * Serve a built site directory over HTTP on 127.0.0.1, the way GitHub Pages does:
 * directories serve their index.html, and a missing path gets 404.html with status 404.
 * @param {string} dir
 * @param {number} [port] 0 picks a free port
 * @returns {Promise<{ url: string, close: () => Promise<void> }>}
 */
export async function serveDir(dir, port = 0) {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    let path;
    try {
      path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    let file = normalize(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
      const page = await readFile(join(root, '404.html')).catch(() => Buffer.from('Not found'));
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(page);
    }
  });
  await new Promise((ready) => server.listen(port, '127.0.0.1', () => ready(undefined)));
  const address = server.address();
  const actual = typeof address === 'object' && address ? address.port : port;
  return {
    url: `http://127.0.0.1:${actual}`,
    close: () => new Promise((done) => server.close(() => done(undefined))),
  };
}
```

- [ ] **Step 4: Create `scripts/lib/serve.d.mts`**

```ts
/** Serve a built site directory over HTTP on 127.0.0.1; port 0 picks a free port. */
export function serveDir(dir: string, port?: number): Promise<{ url: string; close: () => Promise<void> }>;
```

- [ ] **Step 5: Create `scripts/serve.mjs`**

```js
import { serveDir } from './lib/serve.mjs';

const port = Number(process.env.PORT ?? 4321);
const { url } = await serveDir('dist', port);
console.log(`Serving dist/ at ${url}/`);
```

- [ ] **Step 6: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://127.0.0.1:4321' },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://127.0.0.1:4321/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

- [ ] **Step 7: Run it to see it pass**

Run: `npx vitest run tests/unit/serve.test.ts`
Expected: `Tests  6 passed (6)`.

- [ ] **Step 8: Commit**

```bash
git add scripts/lib/serve.mjs scripts/lib/serve.d.mts scripts/serve.mjs playwright.config.ts tests/unit/serve.test.ts
git commit -m "Add the local server and the Playwright config

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 7: Home page

**Files:**
- Create: `src/pages/index.astro`
- Test: `tests/e2e/pages.ts`, `tests/e2e/site.spec.ts`, `tests/e2e/home.spec.ts`

`site.spec.ts` runs six checks on every page in `PAGES`: title, description, canonical URL and one h1; no axe
violations; no sideways scrolling at 320px; the skip link first; her email as the only address, with no form and no
`tel:` link; and nothing loaded from another site. Later tasks add their pages to `PAGES`.

- [ ] **Step 1: Create `tests/e2e/pages.ts`**

```ts
/** Every page the site builds (except the 404 page), for the site-wide checks in site.spec.ts. */
export const PAGES: string[] = [
  '/',
];
```

- [ ] **Step 2: Create `tests/e2e/site.spec.ts`**

```ts
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
```

- [ ] **Step 3: Create `tests/e2e/home.spec.ts`**

```ts
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
```

- [ ] **Step 4: Run them to see them fail**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts tests/e2e/home.spec.ts`
Expected: FAIL: the build succeeds with no pages, so every test gets a 404.

- [ ] **Step 5: Create `src/pages/index.astro`**

```astro
---
import { Image } from 'astro:assets';
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/Button.astro';
import PhotoPanel from '../components/PhotoPanel.astro';
import ProofStrip from '../components/ProofStrip.astro';
import Quote from '../components/Quote.astro';
import WaveDivider from '../components/WaveDivider.astro';
import WorkCard from '../components/WorkCard.astro';
import { photo } from '../lib/images';
import { quote, recommendationCount } from '../lib/quotes';
import { site } from '../lib/site';
import { featuredWork } from '../lib/work';

const headshot = photo('headshot');
const race = photo('race');
const kitten = photo('hannah-kitten');

const figures = [
  { figure: '7+', unit: 'years', caption: 'writing for SaaS products' },
  { figure: '100%', caption: 'of Help Center content owned for two products' },
  { figure: '20+', caption: 'live help articles and videos you can read today' },
  { figure: String(recommendationCount), caption: 'LinkedIn recommendations from managers and teammates' },
];
---
<BaseLayout
  title="Hannah Bailey — Technical writer, UX writer, content designer"
  description="Hannah Bailey is a technical writer, UX writer and content designer who makes complex products easy to understand."
>
  <!-- Hero -->
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-waves" aria-hidden="true">
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" focusable="false">
        <path fill="#c8eae2" d="M0 36c96-28 192 4 288 10s192-24 288-30 192 28 288 32 192-24 288-28 192 12 288 8V200H0z"></path>
        <path fill="#9bdbd0" d="M0 88c96-26 192 6 288 12s192-22 288-28 192 26 288 30 192-22 288-26 192 10 288 6V200H0z"></path>
        <path fill="#5fc4b8" opacity=".45" d="M0 132c96-24 192 6 288 12s192-20 288-26 192 24 288 28 192-20 288-24 192 8 288 4V200H0z"></path>
        <path fill="#fbf3e6" d="M0 162c96-20 192 6 288 10s192-18 288-24 192 22 288 26 192-18 288-22 192 8 288 4V200H0z"></path>
      </svg>
    </div>
    <div class="wrap hero-inner">
      <div class="hero-copy">
        <p class="eyebrow">
          <svg class="wtick" width="28" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false">
            <path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          {site.roles}
        </p>
        <h1 id="hero-title">I make complex products <em>easy</em> to understand.</h1>
        <p class="lede">
          For 7+ years I’ve written the help centers, <span class="nw">in-product</span> copy, onboarding and video that help people use SaaS products with confidence.
        </p>
        <div class="btn-group">
          <Button href="/work/">See my work</Button>
          <Button href="/hannah-bailey-resume.pdf" variant="ghost">Download resume</Button>
        </div>
        <p class="hero-note">
          <span class="dot" aria-hidden="true"></span>
          <span>Based in {site.location} · {site.availability}</span>
        </p>
      </div>

      <div class="hero-photo">
        <span class="photo-stamp" aria-hidden="true">
          <svg width="30" height="20" viewBox="0 0 30 20" fill="none" focusable="false">
            <path d="M1 12.5c3-5 6-5 9 0s6 5 9 0 6-5 9 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </span>
        <div class="photo-frame">
          <Image
            class="hero-img"
            src={headshot}
            width={800}
            height={1000}
            alt="Hannah Bailey smiling at a café table"
            loading="eager"
            fetchpriority="high"
          />
        </div>
      </div>
    </div>
  </section>

  <ProofStrip figures={figures} />

  <!-- Selected work -->
  <section class="work section" id="work" aria-labelledby="work-title">
    <div class="wrap">
      <div class="section-head">
        <svg class="wtick" width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 7.5c3.8-5.4 7.6-5.4 11.4 0s7.6 5.4 11.4 0 5.4-3.8 8.2-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
        <h2 id="work-title">Selected work</h2>
      </div>

      <div class="work-grid">
        {featuredWork.map((page, index) => <WorkCard page={page} accent={((index % 4) + 1) as 1 | 2 | 3 | 4} />)}
      </div>

      <p class="all-work">
        <a class="read" href="/work/">All work <span class="arrow" aria-hidden="true">→</span></a>
      </p>
    </div>
  </section>

  <!-- How I work -->
  <section class="approach section" id="about" aria-labelledby="approach-title">
    <div class="wrap approach-grid">
      <div>
        <div class="approach-head">
          <svg class="wtick" width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false">
            <path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          <h2 id="approach-title">How I work</h2>
        </div>
      </div>
      <div class="approach-text">
        <p>
          I like to get involved before the UI exists. I start with <span class="q">‘Why are we doing this?’</span>, define the problem, and think less about the screen than about how a person moves through the product. That’s where content begins.
        </p>
      </div>
    </div>
  </section>

  <!-- Quote -->
  <WaveDivider color="#0d5660" variant="in" />
  <section class="quote-band" aria-label="Recommendation">
    <div class="wrap">
      <Quote
        quote={quote('barbara-green-home')}
        showRelationship
        highlight="truly helps users succeed"
      />
    </div>
  </section>
  <WaveDivider color="#062e34" variant="out" />

  <!-- Beyond the docs -->
  <section class="beyond" aria-labelledby="beyond-title">
    <div class="wrap">
      <div class="section-head">
        <svg class="wtick" width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 7.5c3.8-5.4 7.6-5.4 11.4 0s7.6 5.4 11.4 0 5.4-3.8 8.2-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
        <h2 id="beyond-title">Beyond the docs</h2>
      </div>

      <div class="beyond-grid">
        <PhotoPanel
          image={race}
          alt="Two motorcycles leaning into a corner on a race track, a red bike leading"
          title="Motorsports photography"
          description="I shoot motorcycle racing up and down the East Coast as Umbra Photography: fast subjects, changing light, tight deadlines."
          link={{ href: site.umbra, label: 'See Umbra Photography' }}
          focus="low"
          width={1200}
          height={800}
        />
        <PhotoPanel
          image={kitten}
          alt="Hannah holding a tabby kitten"
          title="Kitten fostering"
          description="I rescue and foster kittens until they’re healthy, social and ready for a home of their own."
          focus="high"
          width={720}
          height={960}
        />
      </div>
    </div>
  </section>

  <!-- Closing band -->
  <WaveDivider color="#08363d" variant="in" />
  <section class="cta" aria-labelledby="cta-title">
    <div class="wrap">
      <div class="cta-inner">
        <svg class="deco" viewBox="0 0 1200 140" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
          <path d="M-20 96c120-34 240-34 360 0s240 34 360 0 240-34 360 0 240 34 360 0" stroke="#4ecdc0" stroke-opacity=".22" stroke-width="1.5"></path>
          <path d="M-20 118c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0" stroke="#f6b23d" stroke-opacity=".16" stroke-width="1.5"></path>
          <path d="M-20 74c120-38 240-38 360 0s240 38 360 0 240-38 360 0 240 38 360 0" stroke="#4ecdc0" stroke-opacity=".16" stroke-width="1.5"></path>
        </svg>
        <div class="cta-kicker">
          <svg class="wtick" width="54" height="16" viewBox="0 0 54 16" fill="none" aria-hidden="true" focusable="false">
            <path d="M1 10c6-8 12-8 18 0s12 8 18 0 8.6-5.8 16-4.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </div>
        <h2 id="cta-title">Let’s <em>talk</em>.</h2>
        <p>I’m looking for my next technical writing, UX writing or content design role.</p>
        <div class="btn-group">
          <Button href={`mailto:${site.email}`}>Email me</Button>
          <Button href={site.linkedin} variant="ghost">LinkedIn</Button>
        </div>
      </div>
    </div>
  </section>
  <WaveDivider color="#062b31" variant="out" />
</BaseLayout>

<style>
  /* ---------- hero ---------- */
  .hero {
    position: relative;
    overflow: clip;
    padding: clamp(40px, 5.4vw, 68px) 0 clamp(150px, 17vw, 230px);
    background:
      radial-gradient(50% 54% at 82% 10%, rgba(246, 178, 61, 0.34) 0%, rgba(246, 178, 61, 0) 72%),
      linear-gradient(180deg, #fffaef 0%, #fdf4e4 38%, #eefaf5 72%, #dcf4ec 100%);
  }
  .hero-waves {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    z-index: 0;
    width: 100%;
    height: clamp(126px, 15.6vw, 208px);
    pointer-events: none;
  }
  .hero-waves svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .hero-inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.06fr 0.94fr;
    gap: clamp(32px, 4.6vw, 68px);
    align-items: center;
  }
  .nw {
    white-space: nowrap;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding: 9px 15px 9px 12px;
    border-radius: var(--radius-pill);
    background: rgba(11, 139, 135, 0.11);
    border: 1px solid rgba(11, 139, 135, 0.22);
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--deep);
  }
  .eyebrow .wtick {
    width: 26px;
  }
  h1 {
    font-size: var(--display-1);
    line-height: 0.98;
    letter-spacing: -0.036em;
    font-weight: 700;
    text-wrap: balance;
    max-width: 15ch;
  }
  h1 em {
    font-style: italic;
    font-weight: 600;
    letter-spacing: -0.024em;
    color: var(--coral);
  }
  .lede {
    margin-top: clamp(22px, 2.6vw, 30px);
    max-width: 33rem;
    font-size: var(--text-lede);
    line-height: 1.62;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .btn-group {
    margin-top: clamp(28px, 3.4vw, 38px);
  }
  .hero-note {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    margin-top: clamp(24px, 3vw, 32px);
    padding: 9px 17px 9px 10px;
    border-radius: var(--radius-pill);
    background: rgba(255, 252, 244, 0.78);
    border: 1px solid rgba(8, 54, 61, 0.1);
    font-size: 0.92rem;
    color: var(--ink-2);
    line-height: 1.4;
  }
  .hero-note .dot {
    position: relative;
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 50%;
    background: var(--aqua-2);
    display: grid;
    place-items: center;
  }
  .hero-note .dot::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--turquoise);
    box-shadow: 0 0 0 3px rgba(78, 205, 192, 0.35);
  }

  .hero-photo {
    position: relative;
    justify-self: end;
    width: 100%;
    max-width: 414px;
  }
  .hero-photo::before {
    content: '';
    position: absolute;
    z-index: 0;
    inset: 22px -18px -14px 26px;
    background: linear-gradient(155deg, #ffd07a 0%, var(--sun) 44%, var(--sun-deep) 100%);
    border-radius: 999px 999px 28px 28px;
    transform: rotate(-1.8deg);
    box-shadow: 0 30px 50px -34px rgba(231, 154, 36, 0.95);
  }
  .photo-frame {
    position: relative;
    z-index: 1;
    padding: 9px;
    background: var(--paper);
    border-radius: 999px 999px 26px 26px;
    box-shadow:
      var(--shadow-card),
      0 0 0 1px rgba(8, 54, 61, 0.05);
  }
  .photo-frame :global(img.hero-img) {
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    object-position: 58% 31%;
    border-radius: 999px 999px 20px 20px;
  }
  .photo-stamp {
    position: absolute;
    z-index: 2;
    left: -16px;
    bottom: 30px;
    width: 66px;
    height: 66px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--sun);
    border: 4px solid var(--paper);
    box-shadow: 0 14px 26px -14px rgba(8, 54, 61, 0.55);
    color: var(--deep);
  }

  /* ---------- work ---------- */
  .work {
    padding: clamp(50px, 7vw, 86px) 0 clamp(28px, 4vw, 44px);
  }
  .work-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .all-work {
    display: flex;
    justify-content: center;
    margin-top: clamp(20px, 3vw, 30px);
  }

  /* ---------- approach ---------- */
  .approach {
    padding: clamp(46px, 6.6vw, 84px) 0;
  }
  .approach-grid {
    display: grid;
    grid-template-columns: 0.36fr 1fr;
    gap: clamp(28px, 5vw, 72px);
    align-items: start;
  }
  .approach-head {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .approach-head h2 {
    font-size: clamp(1.9rem, 3.4vw, 2.7rem);
    line-height: 1.02;
    letter-spacing: -0.03em;
    font-weight: 600;
    white-space: nowrap;
  }
  .approach-text {
    position: relative;
    padding-left: clamp(24px, 3.6vw, 48px);
  }
  .approach-text::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 3px;
    background: linear-gradient(180deg, var(--turquoise), var(--sun));
    border-radius: 3px;
  }
  .approach-text p {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.35rem, 2.5vw, 1.85rem);
    line-height: 1.4;
    letter-spacing: -0.014em;
    color: var(--ink);
    max-width: 41rem;
    text-wrap: pretty;
  }
  .approach-text .q {
    color: var(--coral-ink);
    font-style: italic;
  }

  /* ---------- quote band ---------- */
  .quote-band {
    background:
      radial-gradient(70% 95% at 88% 0%, rgba(23, 150, 145, 0.42) 0%, rgba(23, 150, 145, 0) 62%),
      linear-gradient(168deg, #0d5660 0%, #083c44 56%, #062e34 100%);
    color: var(--sand);
  }
  .quote-band :global(.wrap) {
    position: relative;
    padding-block: clamp(48px, 6.6vw, 82px);
  }

  /* ---------- beyond ---------- */
  .beyond {
    padding: clamp(48px, 7vw, 88px) 0 clamp(20px, 3vw, 30px);
  }
  .beyond-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* ---------- closing band ---------- */
  .cta {
    position: relative;
    overflow: clip;
    background:
      radial-gradient(72% 84% at 50% -12%, rgba(24, 167, 159, 0.34) 0%, rgba(24, 167, 159, 0) 66%),
      linear-gradient(180deg, #08363d 0%, #0a4750 46%, #062b31 100%);
    color: var(--sand);
  }
  .cta :global(.wrap) {
    position: relative;
    z-index: 1;
    padding-block: clamp(50px, 5.8vw, 74px) clamp(42px, 5vw, 62px);
    text-align: center;
  }
  .cta-inner {
    position: relative;
  }
  .cta-inner .deco {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -38px;
    height: 132px;
    width: 100%;
    pointer-events: none;
    z-index: -1;
    opacity: 0.55;
  }
  .cta-kicker {
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
  }
  .cta-kicker .wtick {
    color: var(--sun);
  }
  .cta h2 {
    font-size: clamp(3.1rem, 7.2vw, 5.5rem);
    line-height: 0.96;
    letter-spacing: -0.042em;
    font-weight: 700;
    color: var(--sand);
  }
  .cta h2 em {
    font-style: italic;
    font-weight: 700;
    color: var(--sun);
    margin-left: 0.05em;
  }
  .cta p {
    margin: 18px auto 0;
    max-width: 34rem;
    color: #cfe4e1;
    font-size: clamp(1rem, 1.3vw, 1.1rem);
    text-wrap: pretty;
  }
  .cta .btn-group {
    justify-content: center;
    margin-top: clamp(26px, 3.4vw, 34px);
  }
  .cta :global(.btn-ghost) {
    color: var(--sand);
    border-color: rgba(251, 243, 230, 0.45);
  }
  .cta :global(.btn-ghost:hover) {
    color: #fffdf7;
    border-color: var(--sand);
    background: rgba(251, 243, 230, 0.14);
  }

  /* ---------- responsive ---------- */
  @media (max-width: 1000px) {
    .hero-inner {
      grid-template-columns: 1.08fr 0.92fr;
      gap: 34px;
    }
    .hero-photo {
      max-width: 368px;
    }
    .eyebrow {
      font-size: 0.67rem;
      letter-spacing: 0.09em;
    }
  }
  @media (max-width: 900px) {
    .approach-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .approach-text {
      padding-left: 22px;
    }
  }
  @media (max-width: 720px) {
    .section {
      scroll-margin-top: 16px;
    }
    .hero {
      padding-top: clamp(30px, 6vw, 46px);
      padding-bottom: clamp(130px, 26vw, 180px);
    }
    .hero-inner {
      grid-template-columns: 1fr;
      gap: clamp(34px, 7vw, 48px);
    }
    .hero-photo {
      justify-self: center;
      max-width: 430px;
      margin-top: 8px;
    }
    .hero-photo::before {
      inset: 16px -12px -10px 18px;
    }
    h1 {
      max-width: 18ch;
    }
    .work-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .beyond-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
  @media (max-width: 520px) {
    .eyebrow {
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      gap: 8px;
      padding: 8px 12px 8px 10px;
    }
    .eyebrow .wtick {
      display: none;
    }
    .hero-note {
      font-size: 0.88rem;
      padding: 8px 14px 8px 8px;
      align-items: flex-start;
    }
    .btn-group :global(.btn) {
      flex: 1 1 100%;
    }
    .photo-stamp {
      left: -6px;
      bottom: 22px;
      width: 58px;
      height: 58px;
    }
    .cta :global(.wrap) {
      padding-block: 52px 58px;
    }
  }
</style>
```

- [ ] **Step 6: Run them to see them pass**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts tests/e2e/home.spec.ts`
Expected: `14 passed`.

- [ ] **Step 7: Look at it**

Run `npm run preview` and open http://127.0.0.1:4321/ at 1280px and at 390px next to the approved mockup,
`.superpowers/drafts/home-a2.html` (kept out of git). They should match: the headshot in its arched frame, the
proof strip, four wave-topped cards, "How I work", the deep-ocean quote band, the two "Beyond the docs" panels and
the "Let's talk." band. The site adds an "All work" link under the cards and the email and LinkedIn links in the
footer. The Work, About and Resume links 404 until their tasks. Stop the server when done.

- [ ] **Step 8: Commit**

```bash
git add src/pages/index.astro tests/e2e/pages.ts tests/e2e/site.spec.ts tests/e2e/home.spec.ts
git commit -m "Add the home page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 8: Work index and the six work pages

**Files:**
- Create: `src/pages/work/index.astro`, `src/pages/work/[slug].astro`
- Modify: `tests/e2e/pages.ts`
- Test: `tests/e2e/work.spec.ts`

One route renders all six pages from `work.yaml`, in the order next/back follows: DocuSign, Help Centers,
onboarding, microcopy, video, marketing emails. The microcopy screenshots keep the spec's order and each opens full
size; the email previews share one aspect ratio so their captions line up, and each opens its PDF.

- [ ] **Step 1: Create `tests/e2e/work.spec.ts`** (the failing test)

```ts
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
      'https://help.acst.com/en/go-method/how-to/integrations/digital-signatures/docusign',
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
  test('lists all fourteen help-site links in their three groups', async ({ page }) => {
    await page.goto('/work/onboarding/');
    const headings = await page.locator('main .prose h2').allTextContents();
    expect(headings).toEqual(['Onboarding', 'First-time setup', 'Release notes ("What\'s new")']);
    const links = page.locator('main a[href^="https://help.acst.com/en/"]');
    await expect(links).toHaveCount(14);
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
```

- [ ] **Step 2: Add the seven work routes to `tests/e2e/pages.ts`**

```ts
/** Every page the site builds (except the 404 page), for the site-wide checks in site.spec.ts. */
export const PAGES: string[] = [
  '/',
  '/work/',
  '/work/docusign-case-study/',
  '/work/help-centers/',
  '/work/onboarding/',
  '/work/microcopy/',
  '/work/video/',
  '/work/marketing-emails/',
];
```

- [ ] **Step 3: Run them to see them fail**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts tests/e2e/work.spec.ts`
Expected: FAIL: the work routes return 404.

- [ ] **Step 4: Create `src/pages/work/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import WorkCard from '../../components/WorkCard.astro';
import { featuredWork, workPages } from '../../lib/work';

// The four cards from Home first, then the two extra pages.
const ordered = [...featuredWork, ...workPages.filter((page) => !page.featured)];
const accents = [1, 2, 3, 4, 1, 2] as const;
---
<BaseLayout
  title="Work · Hannah Bailey"
  description="Help Centers, in-product copy, onboarding, video and marketing: samples from seven years of writing for SaaS products, most of them live today."
>
  <section class="index-hero" aria-labelledby="work-title">
    <div class="hero-waves" aria-hidden="true">
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none" focusable="false">
        <path fill="#c8eae2" d="M0 30c96-24 192 4 288 10s192-22 288-28 192 26 288 30 192-20 288-24 192 10 288 6V160H0z"></path>
        <path fill="#9bdbd0" d="M0 72c96-22 192 6 288 12s192-20 288-26 192 24 288 28 192-18 288-22 192 8 288 4V160H0z"></path>
        <path fill="#5fc4b8" opacity=".45" d="M0 108c96-20 192 6 288 10s192-18 288-24 192 22 288 26 192-18 288-20 192 6 288 4V160H0z"></path>
        <path fill="#fbf3e6" d="M0 132c96-16 192 6 288 10s192-16 288-22 192 20 288 24 192-14 288-18 192 6 288 4V160H0z"></path>
      </svg>
    </div>
    <div class="wrap hero-inner">
      <div class="hero-head">
        <svg class="wtick" width="40" height="14" viewBox="0 0 40 14" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 9c4.5-6.4 9-6.4 13.5 0s9 6.4 13.5 0S33.4 4 39 5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
        <h1 id="work-title">Work</h1>
      </div>
      <p class="lede">Help Centers, in-product copy, onboarding, video and marketing: samples from seven years of writing for SaaS products, most of them live today.</p>
    </div>
  </section>

  <section class="work-index" aria-label="All work">
    <div class="wrap">
      <div class="work-grid">
        {
          ordered.map((page, index) => (
            <WorkCard page={page} accent={accents[index] ?? 1} level="h2" />
          ))
        }
      </div>
    </div>
  </section>
</BaseLayout>

<style>
  .index-hero {
    position: relative;
    overflow: clip;
    padding: clamp(44px, 5.6vw, 76px) 0 clamp(104px, 13vw, 156px);
    background:
      radial-gradient(52% 60% at 84% 6%, rgba(246, 178, 61, 0.3) 0%, rgba(246, 178, 61, 0) 70%),
      linear-gradient(180deg, #fffaef 0%, #fdf4e4 46%, #eefaf5 100%);
  }
  .hero-waves {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    z-index: 0;
    width: 100%;
    height: clamp(74px, 9vw, 118px);
    pointer-events: none;
  }
  .hero-waves svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .hero-inner {
    position: relative;
    z-index: 1;
  }
  .hero-head {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  h1 {
    font-size: clamp(3rem, 6vw, 5rem);
    line-height: 0.98;
    letter-spacing: -0.036em;
    font-weight: 700;
  }
  .lede {
    margin-top: clamp(18px, 2.4vw, 26px);
    max-width: 44rem;
    font-size: var(--text-lede);
    line-height: 1.62;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .work-index {
    padding: clamp(30px, 4vw, 46px) 0 clamp(56px, 7vw, 88px);
  }
  .work-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .work-index :global(.card-title) {
    font-size: clamp(1.35rem, 2.1vw, 1.7rem);
  }

  @media (max-width: 720px) {
    .work-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
  @media (max-width: 520px) {
    .hero-head {
      gap: 12px;
    }
  }
</style>
```

- [ ] **Step 5: Create `src/pages/work/[slug].astro`**

```astro
---
import { Image, getImage } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Quote from '../../components/Quote.astro';
import WorkPageShell from '../../components/WorkPageShell.astro';
import { sample } from '../../lib/images';
import { quote } from '../../lib/quotes';
import { nextWorkPage, type WorkPage, workHref, workPages } from '../../lib/work';

export function getStaticPaths() {
  return workPages.map((page) => ({ params: { slug: page.slug }, props: { page } }));
}

interface Props {
  page: WorkPage;
}
const { page } = Astro.props;
const next = nextWorkPage(page.slug);

/** Only the pages whose examples are external help-site links use the shell's list. */
const liveLinks = ['docusign-case-study', 'video'].includes(page.slug) ? page.links : [];

/** Screenshot samples: the displayed image and the full-size version its link opens. */
const shots = await Promise.all(
  page.images.map(async (image) => {
    const meta = sample(image.key);
    const full = await getImage({ src: meta, width: meta.width });
    const displayWidth = Math.min(meta.width, 960);
    return {
      ...image,
      meta,
      displayWidth,
      displayHeight: Math.round((displayWidth * meta.height) / meta.width),
      href: full.src,
    };
  }),
);

const files = page.files.map((file) => {
  const preview = file.preview ? sample(file.preview) : undefined;
  return {
    ...file,
    preview,
    previewWidth: 450,
    previewHeight: preview ? Math.round((450 * preview.height) / preview.width) : 0,
  };
});

/**
 * Every sample sits in a single column in the order the spec lists it. Narrow screenshots get a
 * narrower frame than landscapes, so the column stays balanced without changing their order.
 */
const frameClass = (shot: { meta: { width: number; height: number } }) => {
  const ratio = shot.meta.width / shot.meta.height;
  if (ratio < 0.8) return 'shot-phone';
  if (ratio < 1.1) return 'shot-square';
  return undefined;
};

const pullQuote = page.quoteId ? quote(page.quoteId) : undefined;
const metaDescription = page.summary;
---
<BaseLayout title={`${page.title} · Hannah Bailey`} description={metaDescription}>
  <WorkPageShell
    label={page.label}
    title={page.title}
    lede={page.lede}
    links={liveLinks}
    next={{ label: next.title, href: workHref(next.slug) }}
  >
    {
      page.sections.map((section, index) => (
        <section>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p>{paragraph}</p>
          ))}

          {section.items.some((item) => item.description) ? (
            <ul class="sample-list">
              {section.items.map((item) => (
                <li class="sample-card">
                  <h3>{item.label}</h3>
                  {item.description && <p>{item.description}</p>}
                  {item.href && (
                    <a class="sample-link" href={item.href}>
                      View live example <span aria-hidden="true">→</span>
                      <span class="visually-hidden">: {item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            section.items.length > 0 && (
              <ul class="link-list">
                {section.items.map((item) => (
                  <li>
                    {item.href ? (
                      <a href={item.href}>
                        {item.label}
                        <span class="arrow" aria-hidden="true">→</span>
                      </a>
                    ) : (
                      item.label
                    )}
                  </li>
                ))}
              </ul>
            )
          )}

          {/* Screenshots and email files belong directly below the section that introduces them. */}
          {index === 0 && shots.length > 0 && (
            <div class="shots">
              {shots.map((shot) => (
                <figure class:list={['shot', frameClass(shot)]}>
                  <a class="shot-link" href={shot.href}>
                    <span class="shot-frame">
                      <Image
                        src={shot.meta}
                        alt={shot.alt}
                        width={shot.displayWidth}
                        height={shot.displayHeight}
                        loading="lazy"
                      />
                    </span>
                    <span class="shot-caption">
                      {shot.caption && <span class="shot-label">{shot.caption}</span>}
                      <span class="shot-open">
                        View full size <span aria-hidden="true">→</span>
                      </span>
                    </span>
                  </a>
                </figure>
              ))}
            </div>
          )}

          {index === 0 && files.length > 0 && (
            <ul class="email-grid">
              {files.map((file) => (
                <li class="email-card">
                  <a class="email-shot" href={file.href}>
                    {file.preview && (
                      <Image
                        src={file.preview}
                        alt={file.previewAlt ?? ''}
                        width={file.previewWidth}
                        height={file.previewHeight}
                        loading="lazy"
                      />
                    )}
                    <span class="email-open">Open PDF</span>
                    <span class="visually-hidden">: {file.label}</span>
                  </a>
                  <h3 class="email-title">{file.label}</h3>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))
    }

    {
      pullQuote && (
        <section class="pullquote" aria-label="Recommendation">
          <Quote quote={pullQuote} tone="plain" showRelationship />
        </section>
      )
    }
  </WorkPageShell>
</BaseLayout>

<style>
  .sample-list {
    display: grid;
    gap: 16px;
    margin: 6px 0 0;
    padding: 0;
    list-style: none;
  }
  .sample-card {
    display: grid;
    gap: 10px;
    padding: clamp(20px, 2.6vw, 28px);
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: var(--radius-card);
    box-shadow: 0 26px 46px -44px rgba(8, 54, 61, 0.55);
  }
  .sample-card h3 {
    font-size: 1.32rem;
    line-height: 1.2;
    letter-spacing: -0.018em;
    color: var(--ink);
  }
  .sample-card p {
    max-width: 46rem;
    font-size: 1rem;
    line-height: 1.6;
  }
  .sample-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 44px;
    width: fit-content;
    color: var(--ocean);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-decoration-color: rgba(13, 92, 102, 0.42);
    text-underline-offset: 4px;
  }
  .sample-link:hover {
    color: var(--deep);
    text-decoration-color: var(--turquoise);
  }

  .link-list {
    display: grid;
    gap: 2px;
    margin: 4px 0 0;
    padding: 0;
    list-style: none;
  }
  .link-list a,
  .link-list li {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    width: fit-content;
    color: var(--ocean);
    font-weight: 600;
    text-decoration-color: rgba(13, 92, 102, 0.42);
    text-underline-offset: 4px;
  }
  .link-list li {
    color: var(--ink-2);
  }
  .link-list a:hover {
    color: var(--deep);
    text-decoration-color: var(--turquoise);
  }
  .link-list .arrow {
    transition: transform 0.2s ease;
  }
  .link-list a:hover .arrow {
    transform: translateX(3px);
  }

  .shots {
    display: grid;
    gap: clamp(28px, 3.4vw, 40px);
    margin-top: 8px;
  }
  .shot {
    width: 100%;
  }
  .shot-phone {
    max-width: 26rem;
  }
  .shot-square {
    max-width: 34rem;
  }
  .shot-link {
    display: grid;
    gap: 10px;
    color: inherit;
    text-decoration: none;
  }
  .shot-frame {
    display: block;
    overflow: hidden;
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: var(--radius-card);
    box-shadow: 0 26px 46px -44px rgba(8, 54, 61, 0.55);
    transition:
      transform 0.22s ease,
      box-shadow 0.22s ease;
  }
  .shot-link:hover .shot-frame {
    transform: translateY(-3px);
    box-shadow: 0 30px 50px -40px rgba(8, 54, 61, 0.65);
  }
  .shot-frame :global(img) {
    width: 100%;
    height: auto;
  }
  .shot-caption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 4px 18px;
  }
  .shot-label {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--ink-2);
  }
  .shot-open {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    color: var(--ocean);
    font-size: 0.9rem;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-decoration-color: rgba(13, 92, 102, 0.42);
    text-underline-offset: 4px;
  }
  .shot-link:hover .shot-open {
    color: var(--deep);
    text-decoration-color: var(--turquoise);
  }

  .email-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
  }
  .email-card {
    display: grid;
    align-content: start;
    gap: 10px;
  }
  .email-shot {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 900 / 1391;
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: 16px;
    box-shadow: 0 22px 38px -36px rgba(8, 54, 61, 0.6);
    transition:
      transform 0.22s ease,
      box-shadow 0.22s ease;
  }
  .email-shot:hover {
    transform: translateY(-3px);
    box-shadow: 0 28px 48px -36px rgba(8, 54, 61, 0.7);
  }
  .email-shot :global(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .email-open {
    position: absolute;
    left: 10px;
    bottom: 10px;
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    background: rgba(8, 54, 61, 0.9);
    color: var(--sand);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    pointer-events: none;
  }
  .email-title {
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .pullquote {
    padding: clamp(22px, 3vw, 32px);
    background:
      radial-gradient(80% 120% at 100% 0%, rgba(246, 178, 61, 0.24) 0%, rgba(246, 178, 61, 0) 62%),
      var(--paper);
    border: 1px solid var(--rule);
    border-left: 4px solid var(--sun);
    border-radius: var(--radius-card);
    box-shadow: 0 26px 46px -44px rgba(8, 54, 61, 0.55);
  }

  @media (max-width: 900px) {
    .email-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 520px) {
    .email-grid {
      grid-template-columns: 1fr;
    }
    .email-shot {
      max-width: 340px;
    }
  }
</style>
```

- [ ] **Step 6: Run them to see them pass**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts tests/e2e/work.spec.ts`
Expected: `61 passed`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/work/index.astro 'src/pages/work/[slug].astro' tests/e2e/pages.ts tests/e2e/work.spec.ts
git commit -m "Add the work index and the six work pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 9: About page

**Files:**
- Create: `src/pages/about.astro`
- Modify: `tests/e2e/pages.ts`
- Test: `tests/e2e/about.spec.ts`

Her story with the five roles, how she works and her note on AI, five quotes with a link to all ten
recommendations, and life beyond the docs.

- [ ] **Step 1: Create `tests/e2e/about.spec.ts`** (the failing test)

```ts
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
```

- [ ] **Step 2: Add `/about/` to `tests/e2e/pages.ts`**

```ts
/** Every page the site builds (except the 404 page), for the site-wide checks in site.spec.ts. */
export const PAGES: string[] = [
  '/',
  '/work/',
  '/work/docusign-case-study/',
  '/work/help-centers/',
  '/work/onboarding/',
  '/work/microcopy/',
  '/work/video/',
  '/work/marketing-emails/',
  '/about/',
];
```

- [ ] **Step 3: Run them to see them fail**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts tests/e2e/about.spec.ts`
Expected: FAIL: `/about/` returns 404.

- [ ] **Step 4: Create `src/pages/about.astro`**

```astro
---
import { Image } from 'astro:assets';
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/Button.astro';
import PhotoPanel from '../components/PhotoPanel.astro';
import Quote from '../components/Quote.astro';
import WaveDivider from '../components/WaveDivider.astro';
import WaveMark from '../components/WaveMark.astro';
import { about } from '../lib/about';
import { photo } from '../lib/images';
import { quote, recommendationCount } from '../lib/quotes';
import { site } from '../lib/site';

const headshot = photo('headshot');
const kindQuotes = about.kindWords.quoteIds.map((id) => quote(id));
const { photography, fostering } = about.beyond;
const race = photo(photography.image);
const kitten = photo(fostering.image);
const gallery = fostering.gallery.map((entry) => ({ ...entry, meta: photo(entry.image) }));
const linkedinLabel = `Read all ${recommendationCount} on LinkedIn`;

// The line from her Notion page, with the last word set in the accent colour.
const personalParts = about.beyond.personal.split('curiosity');
const personalBefore = personalParts[0] ?? '';
const personalAfter = personalParts[1] ?? '';
---
<BaseLayout
  title="About · Hannah Bailey"
  description="Hannah Bailey’s story as a technical writer and UX writer, how she works, kind words from teammates, and life beyond the docs."
>
  <!-- Hero -->
  <section class="about-hero" aria-labelledby="about-title">
    <div class="hero-waves" aria-hidden="true">
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" focusable="false">
        <path fill="#c8eae2" d="M0 36c96-28 192 4 288 10s192-24 288-30 192 28 288 32 192-24 288-28 192 12 288 8V200H0z"></path>
        <path fill="#9bdbd0" d="M0 88c96-26 192 6 288 12s192-22 288-28 192 26 288 30 192-22 288-26 192 10 288 6V200H0z"></path>
        <path fill="#5fc4b8" opacity=".45" d="M0 132c96-24 192 6 288 12s192-20 288-26 192 24 288 28 192-20 288-24 192 8 288 4V200H0z"></path>
        <path fill="#fbf3e6" d="M0 162c96-20 192 6 288 10s192-18 288-24 192 22 288 26 192-18 288-22 192 8 288 4V200H0z"></path>
      </svg>
    </div>
    <div class="wrap hero-inner">
      <div class="hero-copy">
        <p class="eyebrow">
          <svg class="wtick" width="28" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false">
            <path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          {about.hero.eyebrow}
        </p>
        <h1 id="about-title">About <em>Hannah</em></h1>
        <p class="lede">{about.hero.lede}</p>
        <div class="btn-group">
          <Button href={`mailto:${site.email}`}>Email me</Button>
          <Button href="/hannah-bailey-resume.pdf" variant="ghost">Download resume</Button>
        </div>
        <p class="hero-note">
          <span class="dot" aria-hidden="true"></span>
          <span>Based in {site.location} · {site.availability}</span>
        </p>
      </div>

      <div class="hero-photo">
        <span class="photo-stamp" aria-hidden="true">
          <svg width="30" height="20" viewBox="0 0 30 20" fill="none" focusable="false">
            <path d="M1 12.5c3-5 6-5 9 0s6 5 9 0 6-5 9 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </span>
        <div class="photo-frame">
          <Image
            class="hero-img"
            src={headshot}
            width={800}
            height={1000}
            alt="Hannah Bailey smiling at a café table"
            loading="eager"
            fetchpriority="high"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- My story -->
  <section class="story" aria-labelledby="story-title">
    <div class="wrap">
      <div class="section-head">
        <svg class="wtick" width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 7.5c3.8-5.4 7.6-5.4 11.4 0s7.6 5.4 11.4 0 5.4-3.8 8.2-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
        <h2 id="story-title">My story</h2>
      </div>

      <div class="story-grid">
        <div class="story-copy">
          {about.story.paragraphs.map((paragraph) => <p>{paragraph}</p>)}
        </div>

        <ol class="timeline" aria-label="Roles and dates">
          {
            about.story.roles.map((role, index) => (
              <li class:list={[{ current: index === about.story.roles.length - 1 }]}>
                <p class="tl-dates">{role.dates}</p>
                <h3>{role.title}</h3>
                <p class="tl-employer">{role.employer}</p>
                {role.note && <p class="tl-note">{role.note}</p>}
              </li>
            ))
          }
        </ol>
      </div>
    </div>
  </section>

  <!-- How I work -->
  <WaveDivider color="#eaf7f2" variant="in" />
  <section class="how" aria-labelledby="how-title">
    <div class="wrap">
      <div class="section-head">
        <svg class="wtick" width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 7.5c3.8-5.4 7.6-5.4 11.4 0s7.6 5.4 11.4 0 5.4-3.8 8.2-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
        <h2 id="how-title">How I work</h2>
      </div>

      <div class="how-grid">
        <div class="how-copy">
          {about.howIWork.paragraphs.map((paragraph, index) => (
            <p class:list={[{ 'how-lead': index === 0 }]}>{paragraph}</p>
          ))}
        </div>

        <div class="how-side">
          <div class="creates">
            <h3>What I create</h3>
            <p>{about.howIWork.creates.intro}</p>
            <ul>
              {about.howIWork.creates.items.map((item) => <li>{item}</li>)}
            </ul>
          </div>

          <aside class="ai-note" aria-labelledby="ai-title">
            <WaveMark width={34} height={24} />
            <h3 id="ai-title">{about.howIWork.ai.label}</h3>
            <p>{about.howIWork.ai.text}</p>
          </aside>
        </div>
      </div>
    </div>
  </section>
  <WaveDivider color="#e6f5f0" variant="out" />

  <!-- Kind words -->
  <section class="kind" aria-labelledby="kind-title">
    <div class="wrap">
      <div class="section-head">
        <svg class="wtick" width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 7.5c3.8-5.4 7.6-5.4 11.4 0s7.6 5.4 11.4 0 5.4-3.8 8.2-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
        <h2 id="kind-title">Kind words</h2>
      </div>

      <div class="kind-grid">
        {kindQuotes.map((entry) => (
          <div class="kind-card">
            <Quote quote={entry} tone="plain" showRelationship={entry.showRelationship} />
          </div>
        ))}
      </div>

      <p class="kind-more">
        <a class="read" href={site.recommendations}>
          {linkedinLabel} <span class="arrow" aria-hidden="true">→</span>
        </a>
      </p>
    </div>
  </section>

  <!-- Beyond the docs -->
  <section class="beyond" aria-labelledby="beyond-title">
    <div class="wrap">
      <div class="section-head">
        <svg class="wtick" width="34" height="12" viewBox="0 0 34 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 7.5c3.8-5.4 7.6-5.4 11.4 0s7.6 5.4 11.4 0 5.4-3.8 8.2-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
        <h2 id="beyond-title">Beyond the docs</h2>
      </div>

      <div class="beyond-grid">
        <PhotoPanel
          image={race}
          alt={photography.alt}
          title={photography.title}
          description={photography.text}
          link={{ href: site.umbra, label: 'See Umbra Photography' }}
          focus="low"
          width={1200}
          height={800}
        />
        <PhotoPanel
          image={kitten}
          alt={fostering.alt}
          title={fostering.title}
          description={fostering.text}
          focus="high"
          width={720}
          height={960}
        />
      </div>

      <div class="kitten-gallery">
        {
          gallery.map((entry) => (
            <figure class="kitten-shot">
              <Image
                src={entry.meta}
                alt={entry.alt}
                width={600}
                height={800}
                loading="lazy"
              />
            </figure>
          ))
        }
      </div>
    </div>

    <WaveDivider color="#08363d" variant="in" />
    <div class="personal">
      <div class="wrap">
        <svg class="wtick" width="46" height="14" viewBox="0 0 46 14" fill="none" aria-hidden="true" focusable="false">
          <path d="M1 9c5-7 10-7 15 0s10 7 15 0 8-5.2 14-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
        <p>
          {personalBefore}<em>curiosity</em>{personalAfter}
        </p>
      </div>
    </div>
    <WaveDivider color="#062b31" variant="out" />
  </section>
</BaseLayout>

<style>
  /* ---------- hero ---------- */
  .about-hero {
    position: relative;
    overflow: clip;
    padding: clamp(40px, 5.4vw, 68px) 0 clamp(140px, 16vw, 210px);
    background:
      radial-gradient(50% 54% at 82% 10%, rgba(246, 178, 61, 0.34) 0%, rgba(246, 178, 61, 0) 72%),
      linear-gradient(180deg, #fffaef 0%, #fdf4e4 38%, #eefaf5 72%, #dcf4ec 100%);
  }
  .hero-waves {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    z-index: 0;
    width: 100%;
    height: clamp(110px, 14vw, 184px);
    pointer-events: none;
  }
  .hero-waves svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .hero-inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.12fr 0.88fr;
    gap: clamp(30px, 4.4vw, 64px);
    align-items: center;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    padding: 9px 15px 9px 12px;
    border-radius: var(--radius-pill);
    background: rgba(11, 139, 135, 0.11);
    border: 1px solid rgba(11, 139, 135, 0.22);
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--deep);
  }
  .eyebrow .wtick {
    width: 26px;
  }
  h1 {
    font-size: clamp(2.9rem, 5.6vw, 4.8rem);
    line-height: 0.98;
    letter-spacing: -0.036em;
    font-weight: 700;
    text-wrap: balance;
  }
  h1 em {
    font-style: italic;
    font-weight: 600;
    letter-spacing: -0.024em;
    color: var(--coral);
  }
  .lede {
    margin-top: clamp(20px, 2.4vw, 28px);
    max-width: 34rem;
    font-size: var(--text-lede);
    line-height: 1.62;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .btn-group {
    margin-top: clamp(26px, 3.2vw, 36px);
  }
  .hero-note {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    margin-top: clamp(22px, 2.8vw, 30px);
    padding: 9px 17px 9px 10px;
    border-radius: var(--radius-pill);
    background: rgba(255, 252, 244, 0.78);
    border: 1px solid rgba(8, 54, 61, 0.1);
    font-size: 0.92rem;
    color: var(--ink-2);
    line-height: 1.4;
  }
  .hero-note .dot {
    position: relative;
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 50%;
    background: var(--aqua-2);
    display: grid;
    place-items: center;
  }
  .hero-note .dot::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--turquoise);
    box-shadow: 0 0 0 3px rgba(78, 205, 192, 0.35);
  }
  .hero-photo {
    position: relative;
    justify-self: end;
    width: 100%;
    max-width: 352px;
  }
  .hero-photo::before {
    content: '';
    position: absolute;
    z-index: 0;
    inset: 20px -16px -12px 24px;
    background: linear-gradient(155deg, #ffd07a 0%, var(--sun) 44%, var(--sun-deep) 100%);
    border-radius: 999px 999px 28px 28px;
    transform: rotate(-1.8deg);
    box-shadow: 0 30px 50px -34px rgba(231, 154, 36, 0.95);
  }
  .photo-frame {
    position: relative;
    z-index: 1;
    padding: 9px;
    background: var(--paper);
    border-radius: 999px 999px 26px 26px;
    box-shadow:
      var(--shadow-card),
      0 0 0 1px rgba(8, 54, 61, 0.05);
  }
  .photo-frame :global(img.hero-img) {
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    object-position: 58% 31%;
    border-radius: 999px 999px 20px 20px;
  }
  .photo-stamp {
    position: absolute;
    z-index: 2;
    left: -14px;
    bottom: 26px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--sun);
    border: 4px solid var(--paper);
    box-shadow: 0 14px 26px -14px rgba(8, 54, 61, 0.55);
    color: var(--deep);
  }

  /* ---------- my story ---------- */
  .story {
    padding: clamp(44px, 6vw, 78px) 0 clamp(20px, 3vw, 30px);
  }
  .story-grid {
    display: grid;
    grid-template-columns: 1.02fr 0.98fr;
    gap: clamp(32px, 4.6vw, 64px);
    align-items: start;
  }
  .story-copy {
    display: grid;
    gap: 18px;
  }
  .story-copy p {
    max-width: 36rem;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .story-copy p:first-child {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.24rem, 2vw, 1.5rem);
    line-height: 1.48;
    letter-spacing: -0.012em;
    color: var(--ink);
  }

  .timeline {
    position: relative;
    display: grid;
    gap: 18px;
    margin: 0;
    padding: 0 0 0 28px;
    list-style: none;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 8px;
    bottom: 12px;
    width: 2px;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--aqua-5) 0%, var(--turquoise) 100%);
    opacity: 0.65;
  }
  .timeline li {
    position: relative;
  }
  .timeline li::before {
    content: '';
    position: absolute;
    left: -27px;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--turquoise);
    box-shadow: 0 0 0 4px var(--sand);
  }
  .timeline li.current::before {
    background: var(--sun);
  }
  .tl-dates {
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: var(--ocean);
  }
  .timeline h3 {
    margin-top: 3px;
    font-size: 1.06rem;
    line-height: 1.25;
    letter-spacing: -0.012em;
    font-weight: 600;
  }
  .tl-employer {
    margin-top: 1px;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--ink-2);
  }
  .tl-note {
    margin-top: 5px;
    max-width: 34rem;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--ink-2);
  }

  /* ---------- how I work ---------- */
  .how {
    padding: clamp(34px, 4.6vw, 56px) 0 clamp(42px, 5.6vw, 66px);
    background: linear-gradient(180deg, #eaf7f2 0%, #eefaf5 46%, #e6f5f0 100%);
  }
  .how-grid {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: clamp(28px, 4vw, 60px);
    align-items: start;
  }
  .how-copy p {
    max-width: 35rem;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .how-copy p + p {
    margin-top: 16px;
  }
  .how-copy .how-lead {
    max-width: 37rem;
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.26rem, 2.1vw, 1.55rem);
    line-height: 1.45;
    letter-spacing: -0.012em;
    color: var(--ink);
  }
  .creates {
    padding: clamp(22px, 2.8vw, 30px);
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: var(--radius-card);
    box-shadow: 0 26px 46px -44px rgba(8, 54, 61, 0.55);
  }
  .creates h3 {
    font-size: 1.22rem;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }
  .creates p {
    margin-top: 10px;
    max-width: 40ch;
    font-size: 0.96rem;
    line-height: 1.55;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .creates ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
  }
  .creates li {
    padding: 7px 13px;
    border-radius: var(--radius-pill);
    background: rgba(11, 139, 135, 0.1);
    border: 1px solid rgba(11, 139, 135, 0.2);
    color: var(--deep);
    font-size: 0.87rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .ai-note {
    position: relative;
    overflow: hidden;
    margin-top: 16px;
    padding: clamp(22px, 2.8vw, 28px);
    border-radius: var(--radius-card);
    background:
      radial-gradient(90% 110% at 92% 0%, rgba(24, 167, 159, 0.34) 0%, rgba(24, 167, 159, 0) 62%),
      linear-gradient(160deg, #0a4750 0%, #08363d 58%, #062b31 100%);
    color: var(--sand);
    box-shadow: 0 26px 46px -40px rgba(8, 54, 61, 0.75);
  }
  .ai-note :global(.wave-mark) {
    position: absolute;
    top: 18px;
    right: 18px;
    color: var(--turquoise-bright);
    opacity: 0.62;
  }
  .ai-note h3 {
    font-family: var(--sans);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--sun);
  }
  .ai-note p {
    margin-top: 10px;
    max-width: 42ch;
    font-size: 0.98rem;
    line-height: 1.58;
    color: #d3e7e4;
    text-wrap: pretty;
  }

  /* ---------- kind words ---------- */
  .kind {
    padding: clamp(42px, 5.6vw, 70px) 0 clamp(26px, 3.4vw, 36px);
  }
  .kind-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .kind-card {
    padding: clamp(22px, 2.8vw, 30px);
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: var(--radius-card);
    box-shadow: 0 26px 46px -44px rgba(8, 54, 61, 0.55);
  }
  .kind-card :global(.quote blockquote p) {
    max-width: 34ch;
  }
  .kind-card:last-child {
    grid-column: 1 / -1;
  }
  .kind-card:last-child :global(.quote blockquote p) {
    max-width: 62ch;
  }
  .kind-more {
    display: flex;
    justify-content: center;
    margin-top: clamp(20px, 3vw, 28px);
  }

  /* ---------- beyond the docs ---------- */
  .beyond {
    padding: clamp(40px, 5.4vw, 64px) 0 0;
  }
  .beyond > .wrap {
    padding-bottom: clamp(34px, 4.6vw, 52px);
  }
  .beyond-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .kitten-gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    max-width: 720px;
    margin: 20px auto 0;
  }
  .kitten-shot {
    overflow: hidden;
    aspect-ratio: 4 / 5;
    background: var(--sand-3);
    border: 1px solid var(--rule);
    border-radius: var(--radius-card);
  }
  .kitten-shot :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 30%;
  }

  .personal {
    background:
      radial-gradient(72% 84% at 50% -12%, rgba(24, 167, 159, 0.34) 0%, rgba(24, 167, 159, 0) 66%),
      linear-gradient(180deg, #08363d 0%, #0a4750 46%, #062b31 100%);
    color: var(--sand);
    text-align: center;
  }
  .personal :global(.wrap) {
    padding-block: clamp(42px, 5.2vw, 62px);
  }
  .personal .wtick {
    margin: 0 auto 16px;
    color: var(--sun);
  }
  .personal p {
    margin: 0 auto;
    max-width: 34rem;
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.38rem, 2.6vw, 2.05rem);
    line-height: 1.35;
    letter-spacing: -0.018em;
    text-wrap: pretty;
  }
  .personal p em {
    font-style: italic;
    color: var(--sun);
  }

  /* ---------- responsive ---------- */
  @media (max-width: 1000px) {
    .hero-inner {
      grid-template-columns: 1.08fr 0.92fr;
      gap: 32px;
    }
    .hero-photo {
      max-width: 320px;
    }
    .eyebrow {
      font-size: 0.67rem;
      letter-spacing: 0.09em;
    }
  }
  @media (max-width: 900px) {
    .story-grid,
    .how-grid {
      grid-template-columns: 1fr;
    }
    .story-grid {
      gap: 30px;
    }
    .how-grid {
      gap: 28px;
    }
  }
  @media (max-width: 760px) {
    .about-hero {
      padding-top: clamp(30px, 6vw, 46px);
      padding-bottom: clamp(130px, 26vw, 180px);
    }
    .hero-inner {
      grid-template-columns: 1fr;
      gap: clamp(34px, 7vw, 46px);
    }
    .hero-photo {
      justify-self: center;
      max-width: 400px;
      margin-top: 6px;
    }
    .hero-photo::before {
      inset: 16px -12px -10px 18px;
    }
    .kind-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .kind-card:last-child {
      grid-column: auto;
    }
    .kind-card:last-child :global(.quote blockquote p) {
      max-width: 34ch;
    }
    .beyond-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
  @media (max-width: 520px) {
    .eyebrow {
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      gap: 8px;
      padding: 8px 12px 8px 10px;
    }
    .eyebrow .wtick {
      display: none;
    }
    .hero-note {
      font-size: 0.88rem;
      padding: 8px 14px 8px 8px;
      align-items: flex-start;
    }
    .btn-group :global(.btn) {
      flex: 1 1 100%;
    }
    .photo-stamp {
      left: -6px;
      bottom: 22px;
      width: 56px;
      height: 56px;
    }
    .kitten-gallery {
      gap: 12px;
      margin-top: 16px;
    }
  }
</style>
```

- [ ] **Step 5: Run them to see them pass**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts tests/e2e/about.spec.ts`
Expected: `59 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/about.astro tests/e2e/pages.ts tests/e2e/about.spec.ts
git commit -m "Add the about page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 10: 404 page

**Files:**
- Create: `src/pages/404.astro`
- Test: `tests/e2e/not-found.spec.ts`

- [ ] **Step 1: Create `tests/e2e/not-found.spec.ts`** (the failing test)

```ts
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
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx astro build && npx playwright test tests/e2e/not-found.spec.ts`
Expected: FAIL: the server falls back to a plain "Not found" with no heading.

- [ ] **Step 3: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/Button.astro';
import WaveMark from '../components/WaveMark.astro';
---
<BaseLayout
  title="Page not found · Hannah Bailey"
  description="That page doesn’t exist on heyhannah.xyz. Head back home or browse Hannah Bailey’s technical writing, UX writing and content design work."
>
  <section class="not-found" aria-labelledby="not-found-title">
    <div class="nf-waves" aria-hidden="true">
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" focusable="false">
        <path fill="#c8eae2" d="M0 36c96-28 192 4 288 10s192-24 288-30 192 28 288 32 192-24 288-28 192 12 288 8V200H0z"></path>
        <path fill="#9bdbd0" d="M0 88c96-26 192 6 288 12s192-22 288-28 192 26 288 30 192-22 288-26 192 10 288 6V200H0z"></path>
        <path fill="#5fc4b8" opacity=".45" d="M0 132c96-24 192 6 288 12s192-20 288-26 192 24 288 28 192-20 288-24 192 8 288 4V200H0z"></path>
        <path fill="#fbf3e6" d="M0 162c96-20 192 6 288 10s192-18 288-24 192 22 288 26 192-18 288-22 192 8 288 4V200H0z"></path>
      </svg>
    </div>

    <div class="wrap nf-wrap">
      <div class="nf-inner">
        <p class="nf-label">
          <WaveMark width={34} height={24} />
          404
        </p>
        <h1 id="not-found-title">This page drifted <em>off</em>.</h1>
        <p class="nf-text">
          The page you’re looking for doesn’t exist or has moved. Let’s get you back to dry land.
        </p>
        <div class="btn-group">
          <Button href="/">Back home</Button>
          <Button href="/work/" variant="ghost">See my work</Button>
        </div>
      </div>
    </div>
  </section>
</BaseLayout>

<style>
  .not-found {
    position: relative;
    overflow: clip;
    min-height: min(70vh, 620px);
    display: flex;
    align-items: center;
    padding: clamp(48px, 9vh, 96px) 0 clamp(150px, 20vh, 210px);
    background:
      radial-gradient(52% 56% at 82% 4%, rgba(246, 178, 61, 0.3) 0%, rgba(246, 178, 61, 0) 70%),
      linear-gradient(180deg, #fffaef 0%, #fdf4e4 40%, #eefaf5 74%, #dcf4ec 100%);
  }
  .nf-waves {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    width: 100%;
    height: clamp(110px, 15vw, 190px);
    pointer-events: none;
  }
  .nf-waves svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .nf-wrap {
    position: relative;
    z-index: 1;
  }
  .nf-inner {
    max-width: 40rem;
    margin-inline: auto;
    text-align: center;
  }
  .nf-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    padding: 9px 17px 9px 14px;
    border-radius: var(--radius-pill);
    background: rgba(11, 139, 135, 0.11);
    border: 1px solid rgba(11, 139, 135, 0.22);
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--deep);
  }
  .nf-label :global(.wave-mark) {
    color: var(--turquoise);
  }
  h1 {
    font-size: clamp(2.6rem, 5.6vw, 4.6rem);
    line-height: 0.99;
    letter-spacing: -0.036em;
    font-weight: 700;
    text-wrap: balance;
  }
  h1 em {
    font-style: italic;
    font-weight: 600;
    color: var(--coral);
  }
  .nf-text {
    margin: clamp(18px, 2.4vw, 24px) auto 0;
    max-width: 30rem;
    font-size: var(--text-lede);
    line-height: 1.62;
    color: var(--ink-2);
    text-wrap: pretty;
  }
  .btn-group {
    justify-content: center;
    margin-top: clamp(28px, 3.6vw, 38px);
  }

  @media (max-width: 520px) {
    .not-found {
      padding-top: 42px;
      padding-bottom: 168px;
    }
    .btn-group :global(.btn) {
      flex: 1 1 100%;
    }
  }
</style>
```

- [ ] **Step 4: Run the whole suite**

Run: `npx astro build && npx playwright test`
Expected: `83 passed`: the whole browser suite so far.

- [ ] **Step 5: Commit**

```bash
git add src/pages/404.astro tests/e2e/not-found.spec.ts
git commit -m "Add the 404 page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 11: Resume page and PDF

**Files:**
- Create: `scripts/lib/pdf-text.mjs`, `scripts/lib/pdf-text.d.mts`, `src/pages/resume.astro`, `scripts/resume-pdf.mjs`
- Modify: `tests/e2e/pages.ts`
- Test: `tests/unit/pdf-text.test.ts`, `tests/e2e/resume.spec.ts`

From here on, `npm run build` works: it builds the site, prints `/resume/` with print styles to
`dist/hannah-bailey-resume.pdf`, and fails if the PDF runs past two pages, lacks her name, her email or a section,
contains a phone number, or does not open with her name and email. Applicant tracking systems read the PDF's text in
order, which is why the print styles drop the hero's stacking context.

- [ ] **Step 1: Create `tests/unit/pdf-text.test.ts`** (the failing test)

```ts
import { describe, expect, it } from 'vitest';
import { checkResumePdf, PHONE_PATTERN } from '../../scripts/lib/pdf-text.mjs';

const good = [
  'Hannah Bailey',
  'Technical Writer · UX Writer · Content Designer',
  'Florence, SC · baileyhannah995@gmail.com · heyhannah.xyz · linkedin.com/in/hannah-bailey-hb2023',
  'SUMMARY',
  'CORE SKILLS',
  'EXPERIENCE',
  'SELECTED PROJECT',
  'EDUCATION',
].join('\n');

describe('checkResumePdf', () => {
  it('accepts a two-page resume with her name, email and every section', () => {
    expect(checkResumePdf({ pages: 2, text: good })).toEqual([]);
  });

  it('rejects a PDF without text', () => {
    expect(checkResumePdf({ pages: 1, text: '  ' })).toContain('the PDF has no extractable text');
  });

  it('rejects a PDF longer than two pages', () => {
    expect(checkResumePdf({ pages: 3, text: good })).toContain('the PDF runs to 3 pages (limit 2)');
  });

  it('rejects a PDF whose text does not open with her name and contact line', () => {
    // Applicant tracking systems read the text layer in order, so the header must come first.
    const [name, role, contact, ...sections] = good.split('\n');
    expect(checkResumePdf({ pages: 2, text: [...sections, name, role, contact].join('\n') })).toContain(
      'the PDF text does not start with "Hannah Bailey" and her email before "Summary"',
    );
  });

  it('rejects a PDF without her name or her email address', () => {
    expect(checkResumePdf({ pages: 1, text: 'SUMMARY' })).toContain('the PDF text lacks "Hannah Bailey"');
    expect(
      checkResumePdf({
        pages: 1,
        text: 'Hannah Bailey\nSUMMARY\nCORE SKILLS\nEXPERIENCE\nSELECTED PROJECT\nEDUCATION',
      }),
    ).toContain('the PDF text lacks "baileyhannah995@gmail.com"');
  });

  it('names each missing section, in any case', () => {
    expect(checkResumePdf({ pages: 1, text: 'Hannah Bailey\nbaileyhannah995@gmail.com' })).toContain(
      'the PDF text lacks "Selected project"',
    );
  });

  it('rejects a phone number in any common shape', () => {
    // Split, so no whole number sits in the repository.
    for (const phone of ['(555) 555-' + '0100', '555-555-' + '0101', '555.555.' + '0102', 'tel' + ':+15555550103']) {
      expect(checkResumePdf({ pages: 1, text: `${good}\n${phone}` })).toContain(
        'the PDF text contains a phone number',
      );
    }
  });

  it('does not mistake her years, dates or degree for a phone number', () => {
    const text = `${good}\n7+ years · Jan 2026 – Present · 2014 – 2018 · Florence, SC, hybrid`;
    expect(PHONE_PATTERN.test(text)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/unit/pdf-text.test.ts`
Expected: FAIL, because `scripts/lib/pdf-text.mjs` does not exist yet.

- [ ] **Step 3: Create `scripts/lib/pdf-text.mjs`**

```js
import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/** The name the PDF must show, and the only email address it may carry. */
export const RESUME_NAME = 'Hannah Bailey';
export const RESUME_EMAIL = 'baileyhannah995@gmail.com';
export const RESUME_MAX_PAGES = 2;
export const RESUME_HEADINGS = ['Summary', 'Core skills', 'Experience', 'Selected project', 'Education'];

/** A US phone number, in the shapes the content check also rejects. */
export const PHONE_PATTERN =
  /tel:|\(\d{3}\)\s?\d{3}[-.\s‑]\d{4}\b|\b\d{3}[-.‑]\d{3}[-.‑]\d{4}\b/i;

/**
 * The text of a PDF. Runs are joined as written, with a newline where pdf.js marks a line end,
 * and NFKC folds ligature glyphs (so "ﬂ" reads as "fl").
 * @param {string} path
 * @returns {Promise<{ pages: number, text: string }>}
 */
export async function pdfText(path) {
  const data = new Uint8Array(await readFile(path));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const content = await (await doc.getPage(n)).getTextContent();
    pages.push(
      content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : '') : '')).join(''),
    );
  }
  return { pages: doc.numPages, text: pages.join('\n').normalize('NFKC') };
}

/**
 * Problems with a resume PDF's extracted text; an empty list means it passes.
 * @param {{ pages: number, text: string }} pdf
 * @returns {string[]}
 */
export function checkResumePdf({ pages, text }) {
  const problems = [];
  if (!text.trim()) problems.push('the PDF has no extractable text');
  if (pages > RESUME_MAX_PAGES) problems.push(`the PDF runs to ${pages} pages (limit ${RESUME_MAX_PAGES})`);

  const lower = text.toLowerCase();
  if (!lower.includes(RESUME_NAME.toLowerCase())) problems.push(`the PDF text lacks "${RESUME_NAME}"`);
  if (!lower.includes(RESUME_EMAIL.toLowerCase())) problems.push(`the PDF text lacks "${RESUME_EMAIL}"`);
  for (const heading of RESUME_HEADINGS) {
    if (!lower.includes(heading.toLowerCase())) problems.push(`the PDF text lacks "${heading}"`);
  }
  // Applicant tracking systems read the text layer in order, so the header must come first.
  const summaryAt = lower.indexOf(RESUME_HEADINGS[0].toLowerCase());
  const emailAt = lower.indexOf(RESUME_EMAIL.toLowerCase());
  if (!lower.trim().startsWith(RESUME_NAME.toLowerCase()) || emailAt < 0 || emailAt > summaryAt) {
    problems.push(`the PDF text does not start with "${RESUME_NAME}" and her email before "${RESUME_HEADINGS[0]}"`);
  }
  if (PHONE_PATTERN.test(text)) problems.push('the PDF text contains a phone number');
  return problems;
}
```

- [ ] **Step 4: Create `scripts/lib/pdf-text.d.mts`**

```ts
export const RESUME_NAME: string;
export const RESUME_EMAIL: string;
export const RESUME_MAX_PAGES: number;
export const RESUME_HEADINGS: string[];
export const PHONE_PATTERN: RegExp;
export function pdfText(path: string): Promise<{ pages: number; text: string }>;
export function checkResumePdf(pdf: { pages: number; text: string }): string[];
```

- [ ] **Step 5: Run it to see it pass**

Run: `npx vitest run tests/unit/pdf-text.test.ts`
Expected: `Tests  8 passed (8)`.

- [ ] **Step 6: Create `tests/e2e/resume.spec.ts`** (the failing test)

```ts
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
```

- [ ] **Step 7: Add `/resume/` to `tests/e2e/pages.ts`**

```ts
/** Every page the site builds (except the 404 page), for the site-wide checks in site.spec.ts. */
export const PAGES: string[] = [
  '/',
  '/work/',
  '/work/docusign-case-study/',
  '/work/help-centers/',
  '/work/onboarding/',
  '/work/microcopy/',
  '/work/video/',
  '/work/marketing-emails/',
  '/about/',
  '/resume/',
];
```

- [ ] **Step 8: Run them to see them fail**

Run: `npx astro build && npx playwright test tests/e2e/site.spec.ts tests/e2e/resume.spec.ts`
Expected: FAIL: `/resume/` returns 404 and there is no PDF.

- [ ] **Step 9: Create `src/pages/resume.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/Button.astro';
import WaveMark from '../components/WaveMark.astro';
import { resume } from '../lib/resume';
import { site } from '../lib/site';

// The contact line names the site and the profile without the protocol or "www".
const linkedinUrl = new URL(site.linkedin);
const linkedinLabel = `${linkedinUrl.hostname.replace(/^www\./, '')}${linkedinUrl.pathname.replace(/\/$/, '')}`;
const siteLabel = new URL(site.url).host;
---
<BaseLayout
  title="Resume · Hannah Bailey"
  description="Hannah Bailey’s resume: technical writing, UX writing and content design for SaaS products, with seven years of documentation and content strategy experience."
>
  <section class="resume-hero" aria-labelledby="resume-title">
    <div class="hero-waves" aria-hidden="true">
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none" focusable="false">
        <path fill="#c8eae2" d="M0 30c96-24 192 4 288 10s192-22 288-28 192 26 288 30 192-20 288-24 192 10 288 6V160H0z"></path>
        <path fill="#9bdbd0" d="M0 72c96-22 192 6 288 12s192-20 288-26 192 24 288 28 192-18 288-22 192 8 288 4V160H0z"></path>
        <path fill="#5fc4b8" opacity=".45" d="M0 108c96-20 192 6 288 10s192-18 288-24 192 22 288 26 192-18 288-20 192 6 288 4V160H0z"></path>
        <path fill="#fbf3e6" d="M0 132c96-16 192 6 288 10s192-16 288-22 192 20 288 24 192-14 288-18 192 6 288 4V160H0z"></path>
      </svg>
    </div>

    <div class="wrap hero-inner">
      <div class="hero-copy">
        <p class="eyebrow">
          <svg class="wtick" width="26" height="11" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false">
            <path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          Resume
        </p>
        <h1 id="resume-title">{site.name}</h1>
        <p class="role">{resume.headline}</p>
        <p class="contact">
          <span>{site.location}</span>
          <span class="sep" aria-hidden="true">·</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span class="sep" aria-hidden="true">·</span>
          <a href={site.url}>{siteLabel}</a>
          <span class="sep" aria-hidden="true">·</span>
          <a href={site.linkedin}>{linkedinLabel}</a>
        </p>
        <p class="download"><Button href="/hannah-bailey-resume.pdf">Download PDF</Button></p>
      </div>

      <div class="hero-mark" aria-hidden="true">
        <WaveMark width={148} height={104} />
      </div>
    </div>
  </section>

  <section class="resume-body" aria-label="Resume">
    <div class="wrap">
      <article class="paper">
        <section class="rsection" aria-labelledby="summary-title">
          <h2 id="summary-title"><svg class="wtick" width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false"><path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>Summary</h2>
          <p class="summary">{resume.summary}</p>
        </section>

        <section class="rsection" aria-labelledby="skills-title">
          <h2 id="skills-title"><svg class="wtick" width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false"><path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>Core skills</h2>
          <dl class="skills">
            {
              resume.skills.map((group) => (
                <div class="skill">
                  <dt>{group.name}</dt>
                  <dd>{group.items.join(', ')}</dd>
                </div>
              ))
            }
          </dl>
        </section>

        <section class="rsection" aria-labelledby="experience-title">
          <h2 id="experience-title"><svg class="wtick" width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false"><path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>Experience</h2>
          {
            resume.experience.map((job) => (
              <div class="job">
                <div class="job-head">
                  <h3>{job.title}</h3>
                  <p class="job-dates">{job.dates}</p>
                </div>
                <p class="job-meta">{job.place ? `${job.employer} · ${job.place}` : job.employer}</p>
                <ul>
                  {job.bullets.map((bullet) => <li>{bullet}</li>)}
                </ul>
              </div>
            ))
          }
        </section>

        <section class="rsection" aria-labelledby="project-title">
          <h2 id="project-title"><svg class="wtick" width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false"><path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>Selected project</h2>
          <div class="job">
            <div class="job-head">
              <h3>{resume.selectedProject.title}</h3>
            </div>
            <p class="job-meta">{resume.selectedProject.employer}</p>
            <ul>
              {resume.selectedProject.bullets.map((bullet) => <li>{bullet}</li>)}
            </ul>
          </div>
        </section>

        <section class="rsection" aria-labelledby="education-title">
          <h2 id="education-title"><svg class="wtick" width="30" height="12" viewBox="0 0 30 12" fill="none" aria-hidden="true" focusable="false"><path d="M1 7.5c3.5-5 7-5 10.5 0s7 5 10.5 0 5-3.6 7-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>Education</h2>
          <div class="job">
            <div class="job-head">
              <h3>{resume.education.school}</h3>
              <p class="job-dates">{resume.education.dates}</p>
            </div>
            <p class="job-meta">{resume.education.place}</p>
            <p class="degree">{resume.education.degree}</p>
            <ul>
              {resume.education.achievements.map((achievement) => <li>{achievement}</li>)}
            </ul>
          </div>
        </section>
      </article>
    </div>
  </section>
</BaseLayout>

<style>
  /* ---------- hero ---------- */
  .resume-hero {
    position: relative;
    overflow: clip;
    padding: clamp(40px, 5.2vw, 66px) 0 clamp(104px, 13vw, 156px);
    background:
      radial-gradient(50% 56% at 84% 8%, rgba(246, 178, 61, 0.32) 0%, rgba(246, 178, 61, 0) 72%),
      linear-gradient(180deg, #fffaef 0%, #fdf4e4 42%, #eefaf5 100%);
  }
  .hero-waves {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    z-index: 0;
    width: 100%;
    height: clamp(74px, 9vw, 118px);
    pointer-events: none;
  }
  .hero-waves svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .hero-inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(28px, 4vw, 56px);
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 20px;
    padding: 9px 16px 9px 12px;
    border-radius: var(--radius-pill);
    background: rgba(11, 139, 135, 0.11);
    border: 1px solid rgba(11, 139, 135, 0.22);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--deep);
  }
  .eyebrow .wtick {
    width: 24px;
  }
  h1 {
    font-size: clamp(3rem, 6vw, 5rem);
    line-height: 0.98;
    letter-spacing: -0.038em;
    font-weight: 700;
  }
  .role {
    margin-top: 12px;
    font-family: var(--serif);
    font-size: clamp(1.12rem, 2vw, 1.45rem);
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--ocean);
  }
  .contact {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 10px;
    margin-top: 16px;
    font-size: 0.95rem;
    color: var(--ink-2);
  }
  .contact a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--ocean);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-thickness: 1.5px;
    text-underline-offset: 4px;
    text-decoration-color: rgba(13, 92, 102, 0.4);
  }
  .contact a:hover {
    color: var(--deep);
    text-decoration-color: var(--turquoise);
  }
  .sep {
    color: rgba(47, 90, 93, 0.6);
  }
  .download {
    margin-top: 20px;
  }
  .hero-mark {
    justify-self: end;
    color: var(--turquoise);
    opacity: 0.85;
  }

  /* ---------- the paper ---------- */
  .resume-body {
    padding: 0 0 clamp(54px, 7vw, 92px);
  }
  .paper {
    display: grid;
    gap: clamp(26px, 3.2vw, 38px);
    padding: clamp(26px, 4.2vw, 56px);
    background: var(--paper);
    border: 1px solid var(--rule);
    border-radius: clamp(20px, 2.6vw, 30px);
    box-shadow: var(--shadow-card);
  }
  .rsection {
    display: grid;
    gap: 14px;
    width: 100%;
    max-width: 46rem;
    margin-inline: auto;
  }
  .rsection h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(11, 139, 135, 0.16);
    font-size: clamp(1.28rem, 1.9vw, 1.5rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 600;
  }
  .rsection h2 .wtick {
    color: var(--turquoise);
    flex: none;
  }
  .summary {
    max-width: 46rem;
    color: var(--ink-2);
    font-size: 1.02rem;
    line-height: 1.62;
    text-wrap: pretty;
  }

  /* ---------- core skills ---------- */
  .skills {
    display: grid;
    gap: 10px;
    margin: 0;
  }
  .skill {
    display: grid;
    grid-template-columns: 11.5rem minmax(0, 1fr);
    gap: 16px;
    align-items: baseline;
  }
  .skill dt {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--deep);
  }
  .skill dd {
    margin: 0;
    color: var(--ink-2);
    font-size: 0.97rem;
  }

  /* ---------- experience, project, education ---------- */
  .job + .job {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--rule);
  }
  .job-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 20px;
    flex-wrap: wrap;
  }
  .job h3 {
    font-size: 1.13rem;
    line-height: 1.24;
    letter-spacing: -0.014em;
    font-weight: 600;
  }
  .job-dates {
    flex: none;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--ocean);
  }
  .job-meta {
    margin-top: 2px;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ink-2);
  }
  .job ul {
    display: grid;
    gap: 6px;
    margin: 10px 0 0;
    padding-left: 1.1em;
    color: var(--ink-2);
  }
  .job li {
    max-width: 46rem;
    font-size: 0.98rem;
    line-height: 1.55;
    text-wrap: pretty;
  }
  .degree {
    margin-top: 9px;
    font-weight: 600;
    color: var(--ink);
  }

  /* ---------- responsive ---------- */
  @media (max-width: 900px) {
    .hero-mark {
      display: none;
    }
    .hero-inner {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 640px) {
    .skill {
      grid-template-columns: 1fr;
      gap: 2px;
    }
  }
  @media (max-width: 520px) {
    .resume-hero {
      padding-top: clamp(28px, 6vw, 44px);
      padding-bottom: clamp(96px, 24vw, 140px);
    }
    .eyebrow {
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      padding: 8px 13px 8px 10px;
    }
    .eyebrow .wtick {
      display: none;
    }
    .contact {
      column-gap: 8px;
      font-size: 0.9rem;
    }
    .download :global(.btn) {
      flex: 1 1 100%;
    }
    .job-head {
      gap: 2px;
      flex-direction: column;
    }
    .rsection h2 {
      gap: 10px;
    }
  }

  /* ---------- print: two US Letter pages ---------- */
  @page {
    size: letter;
    margin: 0.48in 0.55in;
  }
  @media print {
    :global(body) {
      background: #fff;
      color: #08363d;
      font-size: 9.4pt;
      line-height: 1.34;
    }
    :global(.site-header),
    :global(.site-footer),
    :global(.skip-link) {
      display: none !important;
    }
    .resume-hero {
      padding: 0 0 8pt;
      background: none;
      overflow: visible;
    }
    .hero-waves,
    .hero-mark,
    .eyebrow,
    .download {
      display: none !important;
    }
    /* No stacking context: Chromium writes a positioned, z-indexed block's text last, so the
       name and contact line would follow the whole resume in the PDF's text layer. */
    .resume-hero,
    .hero-inner {
      position: static;
      z-index: auto;
    }
    .hero-inner {
      display: block;
    }
    :global(.wrap) {
      width: 100%;
      max-width: none;
      margin: 0;
    }
    h1 {
      font-size: 22pt;
      line-height: 1.02;
      letter-spacing: -0.02em;
    }
    .role {
      margin-top: 2pt;
      font-size: 10pt;
      color: #0d5c66;
    }
    .contact {
      margin-top: 3pt;
      column-gap: 6pt;
      font-size: 8.7pt;
      color: #2f5a5d;
    }
    .contact a {
      min-height: 0;
      color: #0d5c66;
      text-decoration: none;
    }
    .resume-body {
      padding: 0;
    }
    .paper {
      display: block;
      padding: 0;
      background: none;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .rsection {
      max-width: none;
      margin-top: 11pt;
    }
    .rsection h2 {
      padding-bottom: 2.5pt;
      border-bottom: 1px solid #9bdbd0;
      font-family: var(--sans);
      font-size: 8.6pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #08363d;
      gap: 7pt;
      break-after: avoid;
    }
    .rsection h2 .wtick {
      width: 19pt;
      height: 7pt;
      color: #0b8b87;
    }
    .summary {
      max-width: none;
      font-size: 9.4pt;
      line-height: 1.34;
    }
    .skills {
      gap: 2.5pt;
    }
    .skill {
      grid-template-columns: 1.1in minmax(0, 1fr);
      gap: 8pt;
    }
    .skill dt,
    .skill dd {
      font-size: 9.2pt;
    }
    .job {
      break-inside: avoid;
    }
    /* Space alone between jobs: a rule can land at the top of page 2. */
    .job + .job {
      margin-top: 11pt;
      padding-top: 0;
      border-top: 0;
    }
    .job h3 {
      font-size: 10.4pt;
    }
    .job-dates {
      font-size: 8.2pt;
    }
    .job-meta {
      margin-top: 0.5pt;
      font-size: 9.2pt;
    }
    .job ul {
      margin-top: 3pt;
      gap: 1.5pt;
      padding-left: 11pt;
    }
    .job li {
      max-width: none;
      font-size: 9.2pt;
      line-height: 1.31;
    }
    .degree {
      margin-top: 3pt;
      font-size: 9.2pt;
    }
    a {
      color: #0d5c66;
      text-decoration: none;
    }
  }
</style>
```

- [ ] **Step 10: Create `scripts/resume-pdf.mjs`**

```js
// Prints the built /resume/ page to dist/hannah-bailey-resume.pdf and checks the result.
// Served over HTTP, not opened as a file, so the page's root-relative stylesheets load.
import { chromium } from '@playwright/test';
import { checkResumePdf, pdfText } from './lib/pdf-text.mjs';
import { serveDir } from './lib/serve.mjs';

const OUT = 'dist/hannah-bailey-resume.pdf';

const server = await serveDir('dist');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/resume/`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: OUT, preferCSSPageSize: true, printBackground: false });
} finally {
  await browser.close();
  await server.close();
}

const pdf = await pdfText(OUT);
const problems = checkResumePdf(pdf);
if (problems.length > 0) {
  console.error(`Resume PDF check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Wrote ${OUT}: ${pdf.pages} page(s).`);
```

- [ ] **Step 11: Run them to see them pass**

Run: `npm run build && npx playwright test tests/e2e/site.spec.ts tests/e2e/resume.spec.ts`
Expected: the build ends with `Wrote dist/hannah-bailey-resume.pdf: 2 page(s).`, then `66 passed`.

- [ ] **Step 12: Look at it**

Open `dist/hannah-bailey-resume.pdf`. It should be two US Letter pages: her name, the three roles and the contact
line at the top, then Summary, Core skills, Experience (five roles), Selected project and Education, with no
site header, footer or waves.

- [ ] **Step 13: Commit**

```bash
git add scripts/lib/pdf-text.mjs scripts/lib/pdf-text.d.mts src/pages/resume.astro scripts/resume-pdf.mjs tests/e2e/pages.ts tests/unit/pdf-text.test.ts tests/e2e/resume.spec.ts
git commit -m "Add the resume page and its PDF

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Phase 4: Checks, image and CI

### Task 12: Content check

**Files:**
- Create: `scripts/lib/content-rules.mjs`, `scripts/check-content.mjs`
- Test: `tests/unit/content-rules.test.ts`

The rules from spec section 3: no phone number or `tel:` link, no email address but hers, no placeholder text. The
script reads the text files in `src/`, `public/` and `dist/` (binaries are skipped) and prints file, line and rule
for each problem, never the matched text.

- [ ] **Step 1: Create `tests/unit/content-rules.test.ts`** (the failing test)

```ts
import { describe, expect, it } from 'vitest';
import { findViolations, visibleText } from '../../scripts/lib/content-rules.mjs';

const ids = (text: string) => findViolations(text).map((v) => v.rule);

// Contact-shaped test strings are split, so no whole address or number sits in the repository.
describe('findViolations', () => {
  it('flags phone numbers and tel: links, but not dates or invoice numbers', () => {
    expect(ids('call (555) 555-' + '0100')).toEqual(['phone']);
    expect(ids('or 555-555-' + '0101')).toEqual(['phone']);
    expect(ids('<a href="tel' + ':+15555550102">')).toEqual(['phone']);
    expect(ids('October 2026, invoice IL9XXE6Q-0002, DSC_0001')).toEqual([]);
  });

  it('flags every email address except hers', () => {
    expect(ids('write to someone' + '@example.com today')).toEqual(['email']);
    expect(ids('contact' + '@example.org')).toEqual(['email']);
    expect(ids('baileyhannah995@gmail.com')).toEqual([]);
    expect(ids('BaileyHannah995@Gmail.com')).toEqual([]);
  });

  it('flags placeholders', () => {
    expect(ids('TODO: write this')).toEqual(['placeholder']);
    expect(ids('TBD')).toEqual(['placeholder']);
    expect(ids('Lorem ipsum dolor')).toEqual(['placeholder']);
  });

  it('reports the line number of each match', () => {
    expect(findViolations('ok\nok\nTBD')).toEqual([{ rule: 'placeholder', message: 'a placeholder', line: 3 }]);
  });
});

describe('visibleText', () => {
  it('drops scripts, styles and tags, and decodes entities', () => {
    const html = '<style>.a{}</style><p>Fish &amp; chips</p><script>var x = 1;</script>';
    expect(visibleText(html).trim()).toBe('Fish & chips');
  });

  it('decodes an encoded @, so a hidden address is still caught', () => {
    const html = '<p>write to someone&#64;example.com</p>';
    expect(visibleText(html)).toContain('someone' + '@example.com');
    expect(ids(visibleText(html))).toEqual(['email']);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/unit/content-rules.test.ts`
Expected: FAIL, because `scripts/lib/content-rules.mjs` does not exist yet.

- [ ] **Step 3: Create `scripts/lib/content-rules.mjs`**

```js
/**
 * @typedef {{ id: string, message: string, pattern: RegExp, allow?: (match: string) => boolean }} Rule
 * @typedef {{ rule: string, message: string, line: number }} Violation
 */

/** The only email address the site may show. */
export const ALLOWED_EMAIL = 'baileyhannah995@gmail.com';

/** @type {Rule[]} */
export const RULES = [
  {
    id: 'phone',
    message: 'a phone number or tel: link',
    pattern: /tel:|\(\d{3}\)\s?\d{3}[-.\s‑]\d{4}\b|\b\d{3}[-.‑]\d{3}[-.‑]\d{4}\b/gi,
  },
  {
    id: 'email',
    message: `an email address other than ${ALLOWED_EMAIL}`,
    pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi,
    allow: (match) => match.toLowerCase() === ALLOWED_EMAIL,
  },
  { id: 'placeholder', message: 'a placeholder', pattern: /\b(?:TODO|TBD|lorem ipsum)\b/gi },
];

/**
 * Find rule matches in a text.
 * @param {string} text
 * @returns {Violation[]}
 */
export function findViolations(text) {
  /** @type {Violation[]} */
  const found = [];
  for (const rule of RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      if (rule.allow?.(match[0])) continue;
      const at = match.index ?? 0;
      found.push({ rule: rule.id, message: rule.message, line: text.slice(0, at).split('\n').length });
    }
  }
  return found;
}

/**
 * The text a visitor sees on an HTML page: scripts, styles and tags removed, common entities decoded,
 * so an address written with entities is still caught.
 * @param {string} html
 */
export function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#64;|&commat;/g, '@')
    .replace(/&amp;/g, '&');
}
```

- [ ] **Step 4: Create `scripts/check-content.mjs`**

```js
// Applies the content rules to the site's sources and the built pages.
// Prints file, line and rule for each problem, never the matched text.
// Reads text files only; images, fonts and PDFs are skipped untouched.
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { findViolations, visibleText } from './lib/content-rules.mjs';

const TEXT = new Set(['.astro', '.ts', '.mjs', '.js', '.css', '.md', '.yaml', '.yml', '.json', '.svg', '.html', '.xml', '.txt']);
const BINARY = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.ico', '.gif']);

/** @param {string} dir @returns {AsyncGenerator<string>} */
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

if (!existsSync('dist')) {
  console.error('Run `npm run build` first: the check reads dist/.');
  process.exit(1);
}

/** @type {string[]} */
const problems = [];
let files = 0;
for (const dir of ['src', 'public', 'dist']) {
  for await (const file of walk(dir)) {
    const ext = extname(file).toLowerCase();
    if (BINARY.has(ext) || !TEXT.has(ext)) continue;
    files++;
    const raw = await readFile(file, 'utf8');
    for (const v of findViolations(raw)) problems.push(`${file}:${v.line}: ${v.message} [${v.rule}]`);
    if (ext === '.html') {
      for (const v of findViolations(visibleText(raw))) problems.push(`${file} (visible text): ${v.message} [${v.rule}]`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Content check failed:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`Content check passed: ${files} files.`);
```

- [ ] **Step 5: Run it to see it pass**

Run: `npx vitest run tests/unit/content-rules.test.ts && npm run build && npm run check:content`
Expected: `Tests  6 passed (6)`, then `Content check passed:` with a file count.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/content-rules.mjs scripts/check-content.mjs tests/unit/content-rules.test.ts
git commit -m "Add the content check

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 13: Social preview image

**Files:**
- Create: `scripts/make-og.mjs`, `public/og.png` (generated)

`BaseLayout` already points `og:image` at `/og.png`. The script draws the card in Chromium from the headshot, her
name and her roles, using the site's fonts.

- [ ] **Step 1: Create `scripts/make-og.mjs`**

```js
// Renders public/og.png, the 1200 × 630 image shown when a link to the site is shared.
// The headshot and both fonts are embedded, so nothing is fetched from another origin.
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { parse } from 'yaml';

const site = parse(await readFile('src/data/site.yaml', 'utf8'));
const headshot = (await readFile('src/assets/photos/headshot.jpg')).toString('base64');
const font = async (file) => (await readFile(`node_modules/@fontsource-variable/${file}`)).toString('base64');
const sansFont = async (file) => (await readFile(`node_modules/@fontsource/${file}`)).toString('base64');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const roles = site.roles.split(' · ');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Fraunces Variable'; font-weight: 100 900; font-optical-sizing: auto; src: url(data:font/woff2;base64,${await font('fraunces/files/fraunces-latin-standard-normal.woff2')}) format('woff2-variations'); }
  @font-face { font-family: 'Source Sans 3'; font-weight: 400; src: url(data:font/woff2;base64,${await sansFont('source-sans-3/files/source-sans-3-latin-400-normal.woff2')}) format('woff2'); }
  @font-face { font-family: 'Source Sans 3'; font-weight: 600; src: url(data:font/woff2;base64,${await sansFont('source-sans-3/files/source-sans-3-latin-600-normal.woff2')}) format('woff2'); }
  * { box-sizing: border-box; }
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden;
    background:
      radial-gradient(46% 60% at 88% 8%, rgba(246,178,61,.38) 0%, rgba(246,178,61,0) 70%),
      radial-gradient(60% 70% at 8% 100%, rgba(200,234,226,.55) 0%, rgba(200,234,226,0) 70%),
      #fbf3e6;
    color: #0b3b42; font-family: 'Source Sans 3', sans-serif; }
  .page { display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 88px 0 96px; gap: 48px; }
  .copy { max-width: 620px; }
  .mark { color: #0b8b87; margin-bottom: 26px; }
  h1 { margin: 0; font: 700 108px/0.98 'Fraunces Variable', Georgia, serif; font-optical-sizing: auto; letter-spacing: -0.035em; color: #08363d; }
  .roles { margin: 26px 0 0; font-size: 37px; line-height: 1.32; font-weight: 600; color: #0d5c66; }
  .site { margin: 34px 0 0; font-size: 25px; font-weight: 600; letter-spacing: 0.02em; color: #0b8b87; }
  .photo { position: relative; width: 372px; flex: none; }
  .slab { position: absolute; inset: 22px -20px -16px 24px; border-radius: 999px 999px 30px 30px;
    transform: rotate(-2deg); background: linear-gradient(155deg, #ffd07a 0%, #f6b23d 46%, #e79a24 100%); }
  .frame { position: relative; padding: 10px; background: #fffcf4; border-radius: 999px 999px 28px 28px; }
  img { display: block; width: 100%; height: 466px; object-fit: cover; object-position: 58% 31%; border-radius: 999px 999px 21px 21px; }
</style></head><body>
  <div class="page">
    <div class="copy">
      <svg class="mark" width="76" height="50" viewBox="0 0 27 19" fill="none" aria-hidden="true">
        <path d="M1 12c2.7-4.8 5.4-4.8 8.1 0s5.4 4.8 8.1 0 5.4-4.8 8.1 0" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M2.7 5.6c2.1-3.6 4.2-3.6 6.3 0s4.2 3.6 6.3 0 4.2-3.6 6.3 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
      </svg>
      <h1>${escape(site.name)}</h1>
      <p class="roles">${escape(roles.slice(0, 2).join(' · '))} ·<br>${escape(roles[2] ?? '')}</p>
      <p class="site">heyhannah.xyz</p>
    </div>
    <div class="photo">
      <span class="slab"></span>
      <div class="frame"><img src="data:image/jpeg;base64,${headshot}" alt=""></div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.screenshot({ path: 'public/og.png' });
} finally {
  await browser.close();
}
console.log('Wrote public/og.png');
```

- [ ] **Step 2: Render it**

Run: `npm run make:og`
Expected: `Wrote public/og.png`, a 1200 × 630 image: the headshot, "Hannah Bailey" and "Technical writer · UX writer · Content designer" in the site's palette.

- [ ] **Step 3: Look at it**

Open `public/og.png` and check that the text is sharp, nothing is clipped and her face is fully in frame.

- [ ] **Step 4: Commit**

```bash
git add scripts/make-og.mjs public/og.png
git commit -m "Add the social preview image

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 14: HTML validation, link check and Lighthouse

**Files:**
- Create: `.htmlvalidate.json`, `lighthouserc.json`

Lighthouse runs three times per page and asserts on the best run, so one cold run on a CI machine cannot fail the
build (this happened on blakells.dev).

- [ ] **Step 1: Create `.htmlvalidate.json`**

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "void-style": "off"
  }
}
```

- [ ] **Step 2: Create `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": [
        "http://localhost/",
        "http://localhost/work/",
        "http://localhost/work/docusign-case-study/",
        "http://localhost/about/"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "filesystem", "outputDir": ".lighthouseci" }
  }
}
```

- [ ] **Step 3: Run every check**

Run: `npm run check`
Expected: every step passes: `- 0 errors`, `Tests  63 passed (63)`, `Wrote dist/hannah-bailey-resume.pdf: 2 page(s).`, `Content check passed:`, no HTML errors, the link scan, `95 passed`, and Lighthouse `All results processed!` with no failed assertions.

- [ ] **Step 4: Commit**

```bash
git add .htmlvalidate.json lighthouserc.json
git commit -m "Add HTML validation, the link check and Lighthouse

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 15: CI and README

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`

The workflow is the one blakells.dev and umbreonics.com use: build once, run every check, and deploy that same
build only on a push to `main`.

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run check:types
      - run: npm run test:unit
      - run: npm run build
      - run: npm run check:content
      - run: npm run check:html
      - run: npm run check:links
      - run: npm run test:e2e
      - run: npm run check:lighthouse
      - if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Create `README.md`**

````markdown
# heyhannah.xyz

The portfolio site of Hannah Bailey, technical writer, UX writer and content designer: selected work,
an about page, and a resume.

A static [Astro](https://astro.build) site, deployed to GitHub Pages by GitHub Actions after every
check passes.

## Running it

```sh
npm ci
npx playwright install chromium   # needed before building: the resume PDF is printed with Chromium
npm run build                     # build into dist/, including dist/hannah-bailey-resume.pdf
npm run preview                   # serve dist/ at http://127.0.0.1:4321/
npm run check                     # every check CI runs
```

`npm run dev` starts the Astro dev server.

Building runs two steps: `astro build`, then `scripts/resume-pdf.mjs`, which prints the `/resume/`
page to `dist/hannah-bailey-resume.pdf` and validates that it contains the expected text and fits
on two pages.

## Checks

`npm run check` runs, in order:

- `check:types` — `astro check` (Astro, TypeScript and component types).
- `test:unit` — Vitest: data validation, the components (with Astro's container API), content rules, PDF
  text extraction and the static server.
- `build` — the Astro build plus the resume PDF.
- `check:content` — scans text files in the source, `public/` and `dist/` for phone numbers, any email
  address other than `baileyhannah995@gmail.com`, and placeholder text. Binary files are skipped.
- `check:html` — html-validate over every built page.
- `check:links` — linkinator over every internal link in `dist/`.
- `test:e2e` — Playwright: every page for landmarks, one `h1`, a skip link as the first focus stop,
  no external requests, no sideways scroll at 320px and axe accessibility checks, plus page-specific
  tests.
- `check:lighthouse` — Lighthouse CI on `/`, `/work/`, `/work/docusign-case-study/` and `/about/`,
  three runs each; performance and accessibility must each score at least 0.95.

CI (`.github/workflows/ci.yml`) runs the same checks on every push and pull request. A push to
`main` deploys `dist/` to GitHub Pages only after they pass.

## Where content lives

All copy and facts live in YAML under `src/data/`, validated with zod in `src/lib/`:

- `site.yaml` — name, URL, email, LinkedIn, location, roles and availability used across pages.
- `work.yaml` — the six work pages: title, summary, lede, sections, links, images and files.
- `quotes.yaml` — the recommendation quotes and their attributions.
- `about.yaml` — the About page: hero, story, timeline, how I work, quotes and photos.
- `resume.yaml` — the resume page and the generated PDF: summary, skills, experience, selected
  project and education.

Edit those files and rebuild; the pages, the resume PDF and the tests read from them. Design tokens
(colours, type, spacing) are in `src/styles/tokens.css` and `src/styles/global.css`.

Photos live in `src/assets/photos/`, work samples in `src/assets/samples/`, and the marketing email
PDFs in `public/samples/`, at the paths the spec names.

`npm run make:og` redraws `public/og.png` after the site name or tagline changes.
````

- [ ] **Step 3: Run every check once more**

Run: `npm run check`
Expected: every step passes, as in Task 14.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml README.md
git commit -m "Add CI and the README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Phase 5: Review and launch

### Task 16: Blake's local review

- [ ] **Step 1:** Run `npm run build && npm run preview` and give Blake http://127.0.0.1:4321/.
- [ ] **Step 2:** Blake reads every page at desktop and phone width, and opens the resume PDF and two of the email
  PDFs. Apply his changes with their tests, rerun `npm run check`, and commit.

Every step below is outward-facing. Do each only after Blake says yes to that step at the time.

### Task 17: Repository

- [ ] **Step 1:** Create the public repository and push `main`:

```bash
gh repo create Blakells/heyhannah-site --public --source . --remote origin --push
```

Expected: the repository exists with `main` as its default branch. The CI run starts; its deploy job fails until
Task 18, which is expected.

### Task 18: Pages from GitHub Actions

- [ ] **Step 1:** Switch Pages to the workflow source:

```bash
gh api -X POST repos/Blakells/heyhannah-site/pages -f build_type=workflow
```

- [ ] **Step 2:** Re-run the failed deploy, keeping the push event: `gh run rerun <run id> --failed`. If it is
  refused because the `github-pages` environment does not allow `main`, add the rule and re-run again:

```bash
gh api -X POST repos/Blakells/heyhannah-site/environments/github-pages/deployment-branch-policies -f name=main -f type=branch
```

Expected: the deploy job passes and the site answers at `https://blakells.dev/heyhannah-site/` (its styles only
look right once the custom domain is set, because the site uses root paths).

### Task 19: Custom domain and HTTPS

The DNS records and the domain verification from spec section 6 are already in place: GitHub lists
`heyhannah.xyz` as a verified domain.

- [ ] **Step 1:** Confirm the records with `dig +short heyhannah.xyz A`, `dig +short heyhannah.xyz AAAA` and
  `dig +short www.heyhannah.xyz CNAME`: only GitHub's addresses and `blakells.github.io.`, never Cloudflare's
  (`104.21.*`, `172.67.*`, `2606:4700:*`).
- [ ] **Step 2:** Set the custom domain:

```bash
gh api -X PUT repos/Blakells/heyhannah-site/pages -f cname=heyhannah.xyz
```

- [ ] **Step 3:** Wait for the certificate (`gh api repos/Blakells/heyhannah-site/pages --jq .https_certificate.state`
  reaches `approved`). If it stays empty, remove the domain (`-F cname=null`) and set it again; on blakells.dev that
  made GitHub request the certificate at once.
- [ ] **Step 4:** Enforce HTTPS:

```bash
gh api -X PUT repos/Blakells/heyhannah-site/pages -F https_enforced=true
```

Expected: `https://heyhannah.xyz/` answers 200; `http://`, `www` and `blakells.dev/heyhannah-site/` redirect to it.

### Task 20: The live read-through

- [ ] **Step 1:** Read every page on `https://heyhannah.xyz` at desktop and phone width and click every link,
  including the work samples and the help.acst.com examples.
- [ ] **Step 2:** Download `/hannah-bailey-resume.pdf` and confirm it is the two-page resume, run the link checker
  against the live site, and confirm the share card loads (`/og.png`).
