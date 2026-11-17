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
