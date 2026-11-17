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
