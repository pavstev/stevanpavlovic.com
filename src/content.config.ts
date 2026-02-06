import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

// Enums
const CompanySize = z.enum(["Startup", "Small Business", "Mid-size", "Enterprise"]);
const CompanyType = z.enum(["Full-time", "Contract", "Freelance", "Agency"]);
const ExperienceType = z.enum(["Full-time", "Contract", "Freelance"]);
const Region = z.enum(["North America", "South America", "Europe", "Asia", "Africa", "Oceania", "Remote"]);
const RemoteType = z.enum(["Fully Remote", "Hybrid", "Remote-First"]);
const SocialLinkType = z.enum(["LinkedIn", "Medium", "Twitter", "GitHub", "Facebook", "Instagram", "Website", "Other"]);
const Industry = z.enum([
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
const PersonSocialLinkType = z.enum(["LinkedIn", "Twitter", "GitHub", "Personal Website", "Blog", "Email", "Other"]);
const RelationshipType = z.enum([
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

// Common types
const SocialLink = z.object({
  handle: z.string(),
  name: z.string(),
  type: SocialLinkType,
});

const PersonSocialLink = z.object({
  handle: z.string(),
  name: z.string(),
  type: PersonSocialLinkType,
});

const PersonSocialLinks = z.array(PersonSocialLink).optional();

const CompanySocialLinks = z.array(SocialLink).optional();

// Collections
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
  loader: glob({ base: "./src/content/recommendations", pattern: "**/*.md" }),
  schema: z.object({
    avatar: z.string(),
    company: reference("companies").optional(),
    context: z.string().optional(),
    date: z.coerce.date().optional(),
    linkedInProfile: z.string().url(),
    name: z.string(),
    person: reference("people").optional(),
    relationship: RelationshipType.optional(),
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
  schema: () =>
    z.object({
      company: reference("company"),
      description: z.string(),
      endDate: z.coerce.date().optional(),
      location: reference("locations"),
      recommendations: z.array(reference("recommendations")).optional(),
      role: z.string(),
      startDate: z.coerce.date(),
      tags: z.array(reference("tags")).optional(),
      type: ExperienceType.optional(),
    }),
});

const companies = defineCollection({
  loader: glob({ base: "./src/content/companies", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      description: z.string().optional(),
      founded: z.coerce.date().optional(),
      headquarters: reference("locations").optional(),
      industry: Industry.optional(),
      logo: image().optional(),
      name: z.string(),
      recommendations: z.array(reference("recommendations")).optional(),
      size: CompanySize.optional(),
      socialLinks: CompanySocialLinks,
      type: CompanyType.optional(),
    }),
});

const locations = defineCollection({
  loader: glob({ base: "./src/content/locations", pattern: "**/*.md" }),
  schema: z.object({
    city: z.string().optional(),
    coordinates: z.string().optional(),
    country: z.string(),
    countryCode: z.string().optional(),
    description: z.string().optional(),
    flag: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    name: z.string(),
    region: Region.optional(),
    remote: z.boolean().optional(),
    remoteType: RemoteType.optional(),
    timezone: z.string().optional(),
  }),
});

const people = defineCollection({
  loader: glob({ base: "./src/content/people", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      avatar: image().optional(),
      description: z.string().optional(),
      firstName: z.string(),
      lastName: z.string(),
      location: reference("locations").optional(),
      socialLinks: PersonSocialLinks,
      title: z.string(),
    }),
});

export const collections = {
  blog,
  categories,
  companies,
  experience,
  locations,
  people,
  projects,
  recommendations,
  tags,
};
