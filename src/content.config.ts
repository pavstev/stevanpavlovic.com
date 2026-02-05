import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import fs from "node:fs/promises";
import path from "node:path";

export const CompanySize = z.enum(["Startup", "Small Business", "Mid-size", "Enterprise"]);

export const CompanyType = z.enum(["Full-time", "Contract", "Freelance", "Agency"]);

export const ExperienceType = z.enum(["Full-time", "Contract", "Freelance"]);

export const Region = z.enum([
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
  "Remote",
]);

export const RemoteType = z.enum(["Fully Remote", "Hybrid", "Remote-First"]);

export const SocialLinkType = z.enum([
  "LinkedIn",
  "Medium",
  "YouTube",
  "Twitter",
  "GitHub",
  "Facebook",
  "Instagram",
  "Website",
  "Other",
]);

export const Industry = z.enum([
  "Technology",
  "Software",
  "Internet",
  "E-commerce",
  "Gaming",
  "Sports Betting",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Design",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Transportation",
  "Energy",
]);

export const PersonSocialLinkType = z.enum([
  "LinkedIn",
  "Twitter",
  "GitHub",
  "Personal Website",
  "Blog",
  "Email",
  "Other",
]);

export const RelationshipType = z.enum([
  "Colleague",
  "Manager",
  "Direct Report",
  "Client",
  "Partner",
  "Mentor",
  "Mentee",
  "Friend",
  "Other",
]);

export const TagCategory = z.enum([
  "Backend Development",
  "Frontend Development",
  "Fullstack Development",
  "Cloud & DevOps",
  "Databases",
  "Architecture & Design",
  "APIs & Integrations",
  "Microservices",
  "Message Queues",
  "Testing & QA",
  "Security",
  "Performance Optimization",
  "Project Management",
  "Education & EdTech",
  "Fintech",
  "Healthcare",
  "AI & ML",
  "Web Technologies",
  "Programming Languages",
  "General Concepts",
]);

export const SocialLink = z.object({
  handle: z.string(),
  name: z.string(),
  type: SocialLinkType,
});

export const PersonSocialLink = z.object({
  handle: z.string(),
  name: z.string(),
  type: PersonSocialLinkType,
});

export const PersonSocialLinks = z.array(PersonSocialLink).optional();

export const CompanySocialLinks = z.array(SocialLink).optional();

const tags = defineCollection({
  loader: glob({ base: "./src/content/tags", pattern: "**/*.json" }),
  schema: z.object({
    category: TagCategory,
    description: z.string().optional(),
    featured: z.boolean().default(false).optional(),
    fullDescription: z.string().optional(),
    icon: z.string().default("mdi:tag-outline").optional(),
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
      description: z.string(),
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
  loader: glob({ base: "./src/content/recommendations", pattern: "**/*.json" }),
  schema: ({ image }) =>
    z.object({
      avatar: image(),
      company: z.string().optional(),
      context: z.string().optional(),
      date: z.coerce.date().optional(),
      linkedInProfile: z.string().url(),
      name: z.string(),
      person: reference("people").optional(),
      relationship: RelationshipType.optional(),
      text: z.string().optional(),
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
    }),
});

const experience = defineCollection({
  loader: glob({ base: "./src/content/experience", pattern: "**/*.md" }),
  schema: () =>
    z.object({
      company: reference("companies"),
      description: z.string(),
      endDate: z.coerce.date().optional(),
      role: z.string(),
      startDate: z.coerce.date(),
      tags: z.array(reference("tags")).optional(),
      type: ExperienceType.optional(),
    }),
});

const companies = defineCollection({
  loader: glob({ base: "./src/content/companies", pattern: "**/*.json" }),
  schema: ({ image }) =>
    z.object({
      description: z.string().optional(),
      founded: z.coerce.date().optional(),
      fullDescription: z.string().optional(),
      headquarters: z.string().optional(),
      industry: Industry.optional(),
      logo: image().optional(),
      name: z.string(),
      recommendations: z.array(reference("recommendations")).optional(),
      size: CompanySize.optional(),
      socialLinks: CompanySocialLinks,
      type: CompanyType.optional(),
    }),
});

const people = defineCollection({
  loader: glob({ base: "./src/content/people", pattern: "**/*.json" }),
  schema: ({ image }) =>
    z.object({
      avatar: image().optional(),
      description: z.string().optional(),
      education: z
        .array(
          z.object({
            degree: z.string(),
            school: z.string(),
            year: z.string(),
          })
        )
        .optional(),
      email: z.string().email().optional(),
      firstName: z.string(),
      lastName: z.string(),
      location: z.string().optional(),
      skills: z.array(z.string()).optional(),
      socialLinks: PersonSocialLinks,
      title: z.string(),
    }),
});

const tables = defineCollection({
  loader: async () => {
    const baseDir = path.resolve("./src/content/tables");
    const files = await fs.readdir(baseDir);
    const csvFiles = files.filter((f) => f.endsWith(".csv"));

    const entries = await Promise.all(
      csvFiles.map(async (file) => {
        const filePath = path.join(baseDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const lines = content.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          return headers.reduce(
            (acc, header, i) => {
              acc[header] = values[i];
              return acc;
            },
            {} as Record<string, string>
          );
        });

        return {
          data,
          headers,
          id: path.parse(file).name,
        };
      })
    );

    return entries;
  },
  schema: z.object({
    data: z.array(z.record(z.string())),
    headers: z.array(z.string()),
  }),
});

export const collections = {
  blog,
  companies,
  experience,

  people,
  projects,
  recommendations,
  tables,
  tags,
};
