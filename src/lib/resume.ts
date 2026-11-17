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
