# heyhannah.xyz: design

Hannah Bailey's portfolio site, for recruiters and hiring managers. Approved with Blake in
brainstorming on 2026-11-16 and 2026-11-17.

- **Domain:** heyhannah.xyz (registered on Cloudflare).
- **Repository:** `Blakells/heyhannah-site`. Public; hosted on GitHub Pages and deployed by GitHub Actions, the same
  way as umbreonics.com.
- **Reference mockup:** `.superpowers/drafts/home-a2.html` ("Sun & Surf"). It is not committed (`.superpowers/` is
  ignored), and the build reproduces it.
- **Sources for every claim:** Hannah's resume, her Notion portfolio, her LinkedIn profile and recommendations, and
  Blake's answers.

## 1. Purpose

In 30 seconds, a recruiter learns three things:

1. What she does: technical writing, UX writing and content design, with equal weight.
2. That her work is real: published Help Center articles, videos and samples they can open.
3. How to reach her.

A hiring manager can then go deeper, one work page at a time, and share a single page with a colleague.

The site is written in Hannah's voice (first person). It never invents a fact, number or quote.

## 2. Pages and content

| Path | Purpose |
|---|---|
| `/` | Home: the 30-second summary (below). |
| `/work/` | An index of the six work pages. |
| `/work/docusign-case-study/` | The DocuSign + Go Method case study. |
| `/work/help-centers/` | Help Center ownership for Go Method and Growth Method. |
| `/work/onboarding/` | Onboarding guides, first-time setup and release notes. |
| `/work/microcopy/` | Five UX microcopy samples. |
| `/work/video/` | Product video and walkthroughs. |
| `/work/marketing-emails/` | The trial email series and the first-touch Help Center hubs. |
| `/about/` | Her story, how she works, kind words, and life beyond the docs. |
| `/resume/` | The web resume, plus a PDF (`/hannah-bailey-resume.pdf`) generated from it on every build. |
| 404 | A short page in the site's style, linking to Home and Work. |

**Header.** A small wave mark and "Hannah Bailey", linking home. Links to Work, About and Resume, and an "Email me"
button.

**Footer.** "© 2026 Hannah Bailey · heyhannah.xyz", with the email address and LinkedIn.

**Contact links.**
- Email: `mailto:baileyhannah995@gmail.com`.
- LinkedIn: `https://www.linkedin.com/in/hannah-bailey-hb2023/`.
- There is no form, no phone number and no other email address.

### Home

The page follows the mockup, with this copy.

**1. Hero**
- Eyebrow: "Technical writer · UX writer · Content designer".
- H1: "I make complex products easy to understand." The word "easy" is set in coral italic.
- Lede: "For 7+ years I've written the help centers, in-product copy, onboarding and video that help people use SaaS
  products with confidence."
- Buttons: "See my work" (to `/work/`) and "Download resume" (to `/hannah-bailey-resume.pdf`).
- The headshot, in an arch.
- Note: "Based in Florence, SC · Open to remote, hybrid and on-site roles".

**2. Proof strip**

| Figure | Caption |
|---|---|
| 7+ years | writing for SaaS products |
| 100% | of Help Center content owned for two products |
| 20+ | live help articles and videos you can read today |
| 10 | LinkedIn recommendations from managers and teammates |

**3. Selected work.** Four cards, each linking to its work page.

| Label | Title | Summary |
|---|---|---|
| Case study | Integrating DocuSign with Go Method | A step-by-step admin guide for a confusing setup, which reduced support inquiries and became the template for future integration docs. |
| Documentation | Help Centers for Go Method and Growth Method | Owned the information architecture, articles and metadata for two SaaS products, end to end. |
| UX writing | Microcopy across multiple products | Sign-in, warnings, an AI support chatbot and financial UI: the small words that keep users moving. |
| Video | Product video and walkthroughs | Led UX video across R&D, from scripts and recording to graphics, thumbnails and team training. |

Below the cards, a link: "All work →" (to `/work/`).

**4. How I work.** "I like to get involved before the UI exists. I start with 'Why are we doing this?', define the
problem, and think less about the screen than about how a person moves through the product. That's where content
begins."

**5. Quote**
- "She writes compelling, thoughtful UX copy and has a strong instinct for creating content that truly helps users
  succeed."
- Attribution: "Barbara Green, UX Content Strategy & Operations, managed Hannah directly at ACS Technologies".

**6. Beyond the docs**
- **Motorsports photography** (race photo): "I shoot motorcycle racing up and down the East Coast as Umbra
  Photography: fast subjects, changing light, tight deadlines." Link: "See Umbra Photography →" to
  `https://umbra.smugmug.com`.
- **Kitten fostering** (the photo of Hannah holding a kitten): "I rescue and foster kittens until they're healthy,
  social and ready for a home of their own."

**7. Closing band**
- H2: "Let's talk."
- Line: "I'm looking for my next technical writing, UX writing or content design role."
- Buttons: "Email me" and "LinkedIn".

### Work index

- H1: "Work".
- One line: "Help Centers, in-product copy, onboarding, video and marketing: samples from seven years of writing for
  SaaS products, most of them live today."
- Six cards: the four from Home, plus "Onboarding & release notes" and "Marketing emails".

### Work pages

Every work page has:
- a label, an H1 and a lede;
- the body below;
- a "Live examples" list where one exists. Links go to `help.acst.com` and open in the same tab, as ordinary
  links.
- At the end: "Next: <next work page>" and "Back to all work".

**DocuSign case study** (from her Notion case study)
- Sections:
  - Problem / opportunity
  - Audience
  - Goal
  - Approach / my role
  - Challenges & decisions
  - Outcome / impact
  - What this demonstrates
- Live example: `https://help.acst.com/en/go-method/how-to/integrations/digital-signatures/docusign`.

**Help Centers.** Owned 100% of Help Center content for Go Method and Growth Method: the information architecture,
article structure and topic metadata. Three samples, each with a heading, her one-line description from Notion, and a
link.
- Integrations: `https://help.acst.com/en/go-method/how-to/integrations`
- People: `https://help.acst.com/en/go-method/how-to/manage-people/participants/participant-profiles`
- Funding & Giving: `https://help.acst.com/en/go-method/how-to/giving/allocation-types`

**Onboarding & release notes.** All links are on `https://help.acst.com/en/`.
- **Onboarding:**
  - Getting Started in Go Method (`go-method/guides/getting-started-in-go-method`)
  - Trip Management for Team Leaders (`go-method/guides/trip-management-for-team-leaders`)
  - Getting Started in Growth Method (`growth-method/guides/getting-started-in-growth-method`)
  - Best Practices (`growth-method/guides/best-practices/dynamic-fields`)
  - Daily Management (`growth-method/guides/daily-management/roles`)
- **First-time setup:**
  - Accounts (`go-method/how-to/accounts`)
  - Event Checklist (`go-method/how-to/event-checklist`)
  - Roles & Permissions (`go-method/how-to/manage-people/roles-and-permissions/roles-in-go-method`)
- **Release notes ("What's new"):**
  - Go Method: January 31, 2024; September 13, 2024; December 6, 2024; February 17, 2025; March 28, 2025; July 29, 2025.
  - Paths follow `go-method/whats-new/<year>/<month>-<day>-<year>`.
- The page uses her Notion framing: documentation written alongside frequent Agile releases.

**UX microcopy**
- Lede: "A few samples of my microcopy across multiple products."
- Five images, each with a caption naming what it shows:
  - New user sign-in
  - Informative icons for quick tasks
  - Warning notifications
  - AI + support chatbot
  - Financial UI
- Each image opens full size.

**Product video**
- Her Notion text: multimodal learning, leading UX video across R&D, production guidelines and standards, and
  training colleagues.
- Live examples:
  - Go Method video basics: `https://help.acst.com/en/go-method/video/go-method-basics`
  - Realm getting-started videos: `https://help.acst.com/en/realm/video-library/realm-video-library/getting-started--setup`

**Marketing emails**
- The series: four drip emails for new clients on a 30-day trial, written with the AIDA framework. Each opens as a PDF:
  1. Welcome
  2. Getting started
  3. Integrations
  4. Best use cases
- First-touch hubs, built on a Problem → Value → Guided Action framework:
  - `https://help.acst.com/en/go-method/guides/your-mission-trip-management-hub`
  - `https://help.acst.com/en/growth-method/guides/your-ministry-growth-hub`
- Quote: "She knows how to communicate value in a way customers can easily consume without overwhelming them with
  unnecessary jargon or noise." — Ken Brisco, Product Marketing, ACS Technologies.

### About

**1. My story**
- An intern at ACS Technologies during her senior year at Francis Marion University, which led to a full-time
  position.
- Technical Writer (2019–2021), then UX Writer (2021–2023), then Senior UX Writer (2023–2025).
- Now Documentation and Information Management Specialist at the Drs. Bruce and Lee Foundation (2026–present). There
  she designed a SharePoint records system for more than 30 years of the foundation's records.

**2. How I work.** From her Notion "Content Strategy & Ownership" page:
- getting involved before the UI exists;
- working on Agile teams with product, engineering and support;
- what she creates;
- her honest note on AI: "I haven't owned a fully AI-driven product yet", followed by the adjacent work she has done.

**3. Kind words.** Five quotes, each with name and role:
- "Hannah supported multiple products and consistently got up to speed quickly, taking the time to deeply understand
  and empathize with our customers." — Barbara Green, UX Content Strategy & Operations, her manager.
- "She's a stellar UX writer who quickly understands user intent and needs, creating in-product content that helped
  elevate my design solutions." — Dale Ahn, UX Design Manager.
- "She knows how to dissect complex information and transform it into easy-to-understand documentation." — Dani
  Robertshaw, Technical Writer.
- "As a UX writer, Hannah took the time to deeply understand each project's goals and user needs, and she translated
  complex ideas into clear, effective messaging for clients." — Patrice Bethea, Product Owner.
- "I watched her grow from a college intern during her senior year at Francis Marion University to a Senior
  Technical/UX/Content Writer." — Amy Lauren Scott, Professional & Technical Writer.

Below the quotes: "Read all 10 on LinkedIn →".

**4. Beyond the docs**
- Motorsports photography: the race photo and the Umbra link.
- Kitten fostering: the photo of Hannah with a kitten, plus the two kitten photos.
- One line from her Notion: "Whether I'm absorbed in a good book, traveling, dilly-dallying in Animal Crossing, or
  spending time at the beach, I bring the same curiosity to my life as I do to my work."

### Resume

The web page and the generated PDF share one source of content. The PDF must fit on two pages.

**Header.** "Hannah Bailey" and "Technical Writer · UX Writer · Content Designer".

**Contact line.** Florence, SC · baileyhannah995@gmail.com · heyhannah.xyz · linkedin.com/in/hannah-bailey-hb2023.

**Summary.** Her resume summary, opening "Technical writer, UX writer and content designer with 7+ years of
experience…" in place of "Senior Technical Writer with 7+ years…", to match the site's positioning. The rest of the
wording is unchanged.

**Core skills.** As on her resume: Writing & Content, Tools & Platforms, Documentation and Process.

**Experience.** Titles and dates follow LinkedIn. Bullets come from her resume.

| Role | Employer | Place | Dates |
|---|---|---|---|
| Documentation and Information Management Specialist | Drs. Bruce and Lee Foundation | Florence, SC, hybrid | Jan 2026 – Present |
| Senior UX Writer | ACS Technologies | Remote | Dec 2023 – Dec 2025 |
| Junior UX Writer | ACS Technologies | Remote | Aug 2021 – Dec 2023 |
| Technical Writer | ACS Technologies | Florence, SC, remote | Jan 2019 – Aug 2021 |
| Technical Writing Intern | ACS Technologies | | Jul 2018 – Jan 2019 |

**Selected project.** Integrating DocuSign with Go Method.

**Education.**
- Francis Marion University, BA in Professional, Technical, Business & Scientific Writing, 2014–2018.
- Assisting Editor, Snow Island Review; Peer Writing Tutor; Student Government Association.

## 3. Content rules

- Every claim traces to her resume, Notion, LinkedIn or Blake's answers. No invented figures, employers or quotes.
- Quotes are verbatim excerpts from her public LinkedIn recommendations, attributed by name and role.
- No phone number of hers, anywhere. (The email samples are her former employer's public marketing emails and show
  its public support number; they are images and PDFs, which the content check does not read.)
- No email address other than `baileyhannah995@gmail.com`.
- No placeholder text.
- Her former employer's product names and public help-site links are fine: they are already public on her Notion
  portfolio.

## 4. Look and components

As in the "Sun & Surf" mockup.

**Palette**

| Role | Colors |
|---|---|
| Page (warm sand) | `#fbf3e6` |
| Text and dark bands (deep ocean) | `#08363d` and `#062b31` |
| Ocean teal | `#0d5c66` |
| Signature accent (turquoise): numbers and links | `#0b8b87` |
| Aqua tints | `#c8eae2`, `#9bdbd0` and `#5fc4b8` |
| Primary buttons and highlights (sun-gold) | `#f6b23d` |
| Accent words, such as "easy" (coral) | `#d2532e` and `#b3401f` |

**Type**
- Fraunces for headings, at weight 700, plus italic for accent words.
- Source Sans 3 for body text.
- Both are self-hosted from Fontsource, latin subset.

**Signature details**
- Layered wave shapes under the hero.
- The headshot in an arch, with a gold slab behind it.
- Turquoise proof numbers.
- Work cards with colored wave tops.
- Wave dividers into and out of the deep-ocean quote band.
- A deep-ocean closing band.

**Components:** header, footer, button, wave divider, work card, proof strip, quote, photo panel, resume section, and
a work-page shell (label, H1, lede, body, live examples, next/back).

**Accessibility**
- One H1 per page, landmarks, and a skip link.
- Body text at least 4.5:1 contrast; large text at least 3:1.
- Tap targets at least 44px.
- Visible focus.
- No sideways scrolling from 320px up.
- Meaningful alt text on every photo and sample image.

## 5. Images and files

**Sources.** Five photos Blake supplied: the café headshot, the race, Hannah with a kitten, a kitten, and a cat on
a chair. The originals stay out of the repository.

**Processing.** Photos are cropped (the headshot without the people in the background), resized, compressed, and
stripped of all metadata (EXIF, GPS, camera) before they enter the repository. Astro's image pipeline serves sized
versions.

**Where they live.** The cleaned files are committed before the build, at fixed paths:
- `src/assets/photos/`: `headshot.jpg`, `race.jpg`, `hannah-kitten.jpg`, `kitten-1.jpg`, `kitten-2.jpg`
- `src/assets/samples/`: the five `microcopy-*.png` screenshots and `email-1-preview.jpg` to `email-4-preview.jpg`
  (page images of the emails)
- `public/samples/`: `email-1-welcome.pdf`, `email-2-getting-started.pdf`, `email-3-integrations.pdf`,
  `email-4-best-use-cases.pdf`

**Work samples.** The five microcopy PNGs and four email PDFs come from her public Notion pages. The screenshots were
re-encoded without metadata. Each PDF's document info was rewritten: the title names the email, the author is Hannah
Bailey, and the creator and producer are cleared.

**Share image (`/og.png`).** 1200×630 px: the headshot, "Hannah Bailey", and "Technical writer · UX writer · Content
designer", in the site's palette.

**Favicon.** The wave mark.

## 6. Hosting and domain

- GitHub Pages from `Blakells/heyhannah-site`, deployed by Actions (build type "workflow").
- Custom domain `heyhannah.xyz`, with HTTPS enforced. `www`, `http://` and the github.io address redirect to it.
- Because this is a project site in Blake's account, `blakells.dev/heyhannah-site/` also exists and redirects to
  heyhannah.xyz.

**Cloudflare DNS** (Blake adds the records; all "DNS only", grey cloud):

| Type | Name | Content |
|---|---|---|
| TXT | `_github-pages-challenge-Blakells` | the value GitHub shows when the domain is added under Settings → Pages → Verified domains |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (one record each) |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` (one record each) |
| CNAME | `www` | `blakells.github.io` |

No email records are needed: she uses her Gmail address directly.

## 7. Build

The same versions and tooling as umbreonics.com and blakells.dev:
- Astro 7 (static output, trailing slashes)
- Vitest with the Astro container API
- Playwright with axe
- html-validate, linkinator and Lighthouse CI
- `@astrojs/check`

Content structure:
- Content lives in YAML data files (site facts, work pages, quotes, resume), validated with zod.
- Pages render from that data, so the resume page and PDF share one source.
- `npm run build` runs `astro build` and then generates `dist/hannah-bailey-resume.pdf` from `/resume/`, as on
  blakells.dev.

## 8. Quality checks

`npm run check` runs every check below. CI runs it on every push, and deploys only if it passes.
- Type check.
- Unit tests for the data, components and content rules.
- The build.
- **Content check** over the source, `public/` and `dist/`. It fails on:
  - a phone number;
  - any email address other than `baileyhannah995@gmail.com`;
  - placeholder text.
- HTML validation.
- An internal link check.
- **Playwright tests on every page:**
  - title, description, canonical link and one H1;
  - axe with no violations;
  - no sideways scrolling at 320px;
  - a skip link as the first stop;
  - nothing loaded from another site;
  - mailto links only to her address.

  Plus page-specific tests: Home sections in order, work pages with their live examples, the resume PDF present and
  at most two pages.
- Lighthouse on Home, Work, one work page and About: performance and accessibility of at least 0.95 each (best of 3
  runs).

## 9. What Blake provides

**Already provided:**
- the domain;
- every photo;
- the go-ahead for the quotes, samples, photography and fostering content.

**Still needed:**
1. Add the domain verification TXT record and click Verify in GitHub.
2. Add the DNS records.
3. Give the per-step yes for each launch step.

## 10. Launch

Each step needs Blake's yes when it comes up.

1. **Build:** the full `npm run check` passes locally.
2. **Review:** Blake previews it locally.
3. **Repository:** create `Blakells/heyhannah-site` (public) and push `main`.
4. **Pages:** set Pages to the workflow source. CI builds and deploys.
5. **Domain:** once the DNS resolves to GitHub only (never to Cloudflare's own addresses), set the custom domain,
   wait for the certificate, then enforce HTTPS.
6. **Read-through:** read every page live at desktop and phone width, click every link, confirm
   `/hannah-bailey-resume.pdf` and the share card.

## 11. After launch

- **Content changes** (a new job, new samples) are edits to the YAML data. CI checks and deploys them.
- **Sharing:** Hannah can put heyhannah.xyz on her resume, LinkedIn ("Contact info" and "Featured") and Notion.
