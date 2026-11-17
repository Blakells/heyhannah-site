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
