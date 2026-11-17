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
