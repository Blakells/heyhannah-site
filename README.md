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
