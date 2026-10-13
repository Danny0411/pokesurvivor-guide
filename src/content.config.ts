import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const mechanics = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/mechanics' }),
  schema: z.object({ title: z.string(), order: z.number().optional(), summary: z.string().optional() }),
});

export const collections = { mechanics };
