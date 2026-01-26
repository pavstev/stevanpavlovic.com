import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    description: z.string(),
    heroImage: z.string().optional(),
    pubDate: z.coerce.date(),
    subtitle: z.string().optional(),
    tags: z.array(z.string()).optional(),
    title: z.string(),
    updatedDate: z.coerce.date().optional(),
  }),
  type: "content",
});

const projects = defineCollection({
  schema: z.object({
    description: z.string(),
    heroImage: z.string().optional(),
    link: z.string().url().optional(),
    pubDate: z.coerce.date(),
    subtitle: z.string().optional(),
    tags: z.array(z.string()).optional(),
    title: z.string(),
  }),
  type: "content",
});

const experience = defineCollection({
  schema: z.object({
    company: z.string(),
    description: z.string().optional(),
    endDate: z.coerce.date().optional(), // If not present, it's "Present"
    location: z.string().optional(),
    role: z.string(),
    skills: z.array(z.string()).optional(),
    startDate: z.coerce.date(),
    website: z.string().url().optional(),
  }),
  type: "content",
});

export const collections = { blog, experience, projects };
