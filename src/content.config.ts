import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { IDEA_STAGE_IDS } from './data/idea-stages';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string().optional(),
    category: z.enum(['notes', 'material-design', 'econ-math']).default('notes'),
    cover: z.string().optional(),
    series: z.string().optional(),
    seriesPart: z.number().int().positive().optional(),
    developmentStages: z.array(z.string()).optional(),
    idea: z.object({
      name: z.string().optional(),
      status: z.enum(IDEA_STAGE_IDS),
      log: z.array(z.object({
        stage: z.enum(IDEA_STAGE_IDS),
        date: z.date(),
        summary: z.string(),
      })).min(1),
    }).optional(),
  }),
});

export const collections = { posts };
