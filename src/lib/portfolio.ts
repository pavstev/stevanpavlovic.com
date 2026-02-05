import { getCollection } from "astro:content";

export interface PortfolioItem {
  desc: string;
  href?: string;
  id: string;
  meta: string;
  subtitle: string;
  tags: string[];
  title: string;
}

export const getProjects = async (): Promise<PortfolioItem[]> => {
  const projectsEntries = await getCollection("projects");
  return projectsEntries.map(entry => ({
    desc: entry.data.desc,
    href: `/projects/${entry.id}/`,
    id: entry.id,
    meta: entry.data.meta,
    subtitle: entry.data.subtitle,
    tags: entry.data.tags,
    title: entry.data.title,
  }));
};

export const getExperience = async (): Promise<PortfolioItem[]> => {
  const experienceEntries = await getCollection("experience");
  return experienceEntries
    .sort((a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf())
    .map(entry => ({
      desc: entry.data.description,
      href: `/experience/${entry.id}/`,
      id: entry.id,
      meta: `${entry.data.startDate.getFullYear().toString()} - ${
        entry.data.endDate ? entry.data.endDate.getFullYear().toString() : "Present"
      } · ${entry.data.location}`,
      subtitle: entry.data.role,
      tags: entry.data.skills ?? [],
      title: entry.data.company,
    }));
};
