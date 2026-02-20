import { type CollectionEntry, getCollection, getEntries } from "astro:content";

import { SITE_CONFIG, SOCIALS } from "../constants";
import { RESUME_AVATAR_URL, SKILL_GROUPS } from "../integrations/resume-generator";

interface ResumeData {
  $schema?: string;
  awards: never[];
  basics: {
    email: string;
    image: string;
    label: string;
    location: {
      address: string;
      city: string;
      countryCode: string;
      postalCode: string;
      region: string;
    };
    name: string;
    profiles: {
      network: string;
      url?: string;
      username: string;
    }[];
    summary: string;
    url?: string;
  };
  education: never[];
  interests: never[];
  languages: never[];
  projects: {
    description: string;
    highlights: string[];
    keywords: string[];
    name: string;
    roles: string[];
    url?: string;
  }[];
  publications: never[];
  references: never[];
  skills: {
    keywords: string[];
    name: string;
  }[];
  volunteer: never[];
  work: {
    endDate: string | undefined;
    highlights: string[];
    name: string;
    position: string;
    startDate: string;
    summary: string;
    url?: string;
  }[];
}

const ensureUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export const getSocialIcon = (network: string): string => {
  const iconMap: Record<string, string> = {
    Email: "mdi:email",
    GitHub: "mdi:github",
    LinkedIn: "mdi:linkedin",
    Twitter: "mdi:twitter",
  };
  return iconMap[network] || "mdi:link-variant";
};

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "Present";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export const getDuration = (startDate: string, endDate: string | undefined): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths}mo`;
  if (remainingMonths === 0) return `${years}yr`;
  return `${years}yr ${remainingMonths}mo`;
};

export const getResumeData = async (site?: URL): Promise<ResumeData> => {
  let experiences: CollectionEntry<"experience">[] = [];
  let projects: CollectionEntry<"projects">[] = [];
  let tags: CollectionEntry<"tags">[] = [];

  try {
    experiences = await getCollection("experience");
  } catch {
    // Ignore error if collection doesn't exist or is empty
  }

  try {
    projects = await getCollection("projects");
  } catch {
    // Ignore error if collection doesn't exist or is empty
  }

  try {
    tags = await getCollection("tags");
  } catch {
    // Ignore error if collection doesn't exist or is empty
  }

  const work = await Promise.all(
    experiences
      .sort((a, b) => b.data.startDate.getTime() - a.data.startDate.getTime())
      .map(async (exp) => {
        let companyName = "Unknown Company";
        let companyUrl: string | undefined;

        try {
          if (exp.data.company) {
            const companyEntry = await getEntries([exp.data.company]);
            const company = companyEntry[0] as CollectionEntry<"companies">;
            if (company?.data) {
              companyName = company.data.name;
              companyUrl = ensureUrl(
                company.data.socialLinks?.find(
                  (s: { handle: string; type: string }) => s.type === "Website"
                )?.handle
              );
            }
          }
        } catch {
          // Ignore error if company entry is missing
        }

        const highlights: string[] = [];
        if (exp.data.tags) {
          try {
            const expTags = await getEntries(exp.data.tags);
            highlights.push(...expTags.map((t) => (t as CollectionEntry<"tags">).data.label));
          } catch {
            // Ignore error if tags entries are missing
          }
        }

        return {
          endDate: exp.data.endDate ? exp.data.endDate.toISOString().split("T")[0] : undefined,
          highlights: highlights,
          name: companyName,
          position: exp.data.role || "Unknown Position",
          startDate: exp.data.startDate
            ? exp.data.startDate.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          summary: exp.data.description || "",
          url: companyUrl,
        };
      })
  );

  const projectList = await Promise.all(
    projects.map(async (p) => {
      const highlights: string[] = [];
      if (p.data.challenges) highlights.push(...p.data.challenges);
      if (p.data.impact) highlights.push(p.data.impact);

      let keywords: string[] = [];
      if (p.data.tags) {
        try {
          const projectTags = await getEntries(p.data.tags);
          keywords = projectTags.map((t) => (t as CollectionEntry<"tags">).data.label);
        } catch {
          // Ignore error if project tags are missing
        }
      }

      return {
        description: p.data.description || "",
        highlights,
        keywords,
        name: p.data.title || "Untitled Project",
        roles: p.data.role ? [p.data.role] : [],
        url: ensureUrl(p.data.demoUrl || p.data.repoUrl),
      };
    })
  );

  const skillsMap = tags.reduce(
    (acc, tag) => {
      const group = SKILL_GROUPS[tag.data.label] ?? SKILL_GROUPS[tag.id] ?? "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(tag.data.label);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const skills = Object.entries(skillsMap).map(([name, keywords]) => ({
    keywords,
    name,
  }));

  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/refs/heads/master/schema.json",
    awards: [],
    basics: {
      email: SITE_CONFIG.email,
      image: RESUME_AVATAR_URL,
      label: SITE_CONFIG.headline,
      location: {
        address: SITE_CONFIG.location,
        city: "Belgrade",
        countryCode: "RS",
        postalCode: "",
        region: "Serbia",
      },
      name: SITE_CONFIG.author,
      profiles: SOCIALS.map((s) => ({
        network: s.name,
        url: ensureUrl(s.href),
        username: s.handle,
      })),
      summary: SITE_CONFIG.bio,
      url: ensureUrl(site?.toString() || "https://stevanpavlovic.com"),
    },
    education: [],
    interests: [],
    languages: [],
    projects: projectList,
    publications: [],
    references: [],
    skills: skills,
    volunteer: [],
    work: work,
  };
};
