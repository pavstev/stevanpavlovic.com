import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      challenges: z.array(z.string()).optional(),
      demoUrl: z.string().url(),
      desc: z.string(),
      duration: z.string().optional(),
      featured: z.boolean(),
      image: image(),
      impact: z.string().optional(),
      meta: z.string(),
      repoUrl: z.string().url().optional(),
      role: z.string().optional(),
      subtitle: z.string(),
      tags: z.array(z.string()),
      teamSize: z.string().optional(),
      title: z.string(),
    }),
});

const recommendations = defineCollection({
  loader: glob({ base: "./src/content/recommendations", pattern: "**/*.md" }),
  schema: z.object({
    avatar: z.string(),
    company: z.string(),
    context: z.string().optional(),
    date: z.coerce.date().optional(),
    linkedInProfile: z.string().url(),
    name: z.string(),
    relationship: z.string().optional(),
    title: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      description: z.string(),
      heroImage: image().optional(),
      pubDate: z.coerce.date(),
      tags: z.array(z.string()),
      title: z.string(),
      updatedDate: z.coerce.date().optional(),
    }),
});

const experience = defineCollection({
  loader: glob({ base: "./src/content/experience", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      company: z.union([
        z.string(),
        z.object({
          logo: image().optional(),
          name: z.string(),
          website: z.string().url(),
        }),
      ]),
      description: z.string(),
      endDate: z.coerce.date().optional(),
      location: z.string(),
      role: z.string(),
      skills: z.array(z.string()).optional(),
      startDate: z.coerce.date(),
      type: z.enum(["Full-time", "Contract", "Freelance"]).optional(),
    }),
});

export const collections = {
  blog,
  experience,
  projects,
  recommendations,
};
