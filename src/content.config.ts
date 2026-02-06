import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const categories = defineCollection({
  loader: glob({ base: "./src/content/categories", pattern: "**/*.md" }),
  schema: z.object({
    color: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    id: z.string(),
    label: z.string(),
  }),
});

const tags = defineCollection({
  loader: glob({ base: "./src/content/tags", pattern: "**/*.md" }),
  schema: z.object({
    category: reference("categories"),
    description: z.string().optional(),
    id: z.string(),
    label: z.string(),
    related: z.array(reference("tags")).optional(),
  }),
});

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
      tags: z.array(reference("tags")),
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
      image: image().optional(),
      pubDate: z.coerce.date(),
      tags: z.array(reference("tags")),
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
      skills: z.array(reference("tags")).optional(),
      startDate: z.coerce.date(),
      type: z.enum(["Full-time", "Contract", "Freelance"]).optional(),
    }),
});

const companies = defineCollection({
  loader: glob({ base: "./src/content/companies", pattern: "**/*.md" }),
  schema: z.object({
    awards: z.array(z.string()).optional(),
    clients: z.array(z.string()).optional(),
    description: z.string().optional(),
    founded: z.string().optional(),
    headquarters: z.string().optional(),
    industry: z.string().optional(),
    logo: z.string().optional(),
    name: z.string(),
    notableProjects: z.array(z.string()).optional(),
    size: z.enum(["Startup", "Small Business", "Mid-size", "Enterprise"]).optional(),
    technologies: z.array(z.string()).optional(),
    type: z.enum(["Full-time", "Contract", "Freelance", "Agency"]).optional(),
    website: z.string().url().optional(),
    socialLinks: z
      .array(
        z.object({
          type: z.enum(["LinkedIn", "Twitter", "GitHub", "Facebook", "Instagram", "Website"]),
          handle: z.string(),
          name: z.string(),
        }),
      )
      .optional(),
  }),
});

const locations = defineCollection({
  loader: glob({ base: "./src/content/locations", pattern: "**/*.md" }),
  schema: z.object({
    city: z.string().optional(),
    coordinates: z.string().optional(),
    country: z.string(),
    description: z.string().optional(),
    name: z.string(),
    region: z.enum(["North America", "South America", "Europe", "Asia", "Africa", "Oceania", "Remote"]).optional(),
    remote: z.boolean().optional(),
    remoteType: z.enum(["Fully Remote", "Hybrid", "Remote-First"]).optional(),
    timezone: z.string().optional(),
    countryCode: z.string().optional(),
    flag: z.string().optional(),
    gallery: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog,
  categories,
  companies,
  experience,
  locations,
  projects,
  recommendations,
  tags,
};
