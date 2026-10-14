import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localMedia = z
  .string()
  .regex(/^\/media\/[a-zA-Z0-9/_\-.]+$/)
  .refine(
    (value) => !value.split('/').includes('..'),
    'Media must stay inside public/media',
  );
const webLink = z.url().refine((value) => /^https?:\/\//.test(value));

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    displayTitle: z.string().min(1).optional(),
    summary: z.string().min(1).max(320),
    context: z.string().min(1),
    role: z.string().min(1),
    contributions: z.array(z.string().min(1)).min(1),
    workflow: z
      .array(
        z.object({ title: z.string().min(1), description: z.string().min(1) }),
      )
      .length(3),
    order: z.number().int().positive(),
    featured: z.boolean(),
    categories: z.array(z.string().min(1)).min(1),
    technologies: z.array(z.string().min(1)).min(1),
    editorialStatus: z.enum(['draft', 'reviewed']),
    poster: z.object({
      src: localMedia,
      alt: z.string().min(1),
      caption: z.string().min(1),
    }),
    scenePoster: localMedia.optional(),
    video: localMedia.optional(),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    links: z
      .object({
        code: webLink.optional(),
        report: webLink.optional(),
        demo: webLink.optional(),
      })
      .default({}),
  }),
});

export const collections = { projects };
