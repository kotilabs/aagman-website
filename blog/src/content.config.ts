import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string(),
    slug: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    author: z.string(),
    authorSlug: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    canonical: z.string().optional(),
    ogImage: z.string().optional(),
    readingTime: z.number().optional(),
  }),
});

export const collections = { posts };
