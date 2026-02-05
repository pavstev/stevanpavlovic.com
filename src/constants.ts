import pkgJson from "../package.json" with { type: "json" };
import profileImage from "./assets/profile.jpeg";

// Constants removed: SITE_DESCRIPTION, SITE_TITLE

export const fullName = pkgJson.author.name;

const headline = "Technical Lead and Senior Software Engineer";

export const SITE_CONFIG = {
  author: fullName,
  avatar: profileImage,
  bio: `${headline} with over 10 years of experience delivering high-impact solutions for fintech, betting, and logistics sectors. Expert in architecting scalable microservices using Node.js and NestJS, optimizing high-traffic distributed systems, and modernizing legacy infrastructures. Specialized in performance tuning, event-driven architectures (Kafka), and automated DevOps workflows.`,
  email: pkgJson.author.email,
  headline,
  hero: {
    highlight: "Resilient",
    title: "Architecting Distributed Systems.",
  },
  location: "Belgrade, Serbia",
  status: "Open to Opportunities",
  tagline: "a software engineer focused on distributed systems and backend architecture",
  title: `${fullName} - ${headline}`,
  url: pkgJson.author.url,
} as const;

interface NavItem {
  description: string;
  href: string;
  icon: `mdi:${string}`;
  label: string;
  order: number;
  tagTitle: string;
}

export const NAV_ITEMS = {
  blog: {
    description: "Read insights on distributed systems and software architecture",
    href: "/blog",
    icon: "mdi:newspaper-variant-outline",
    label: "Blog",
    order: 4,
    tagTitle: "Tags",
  },
  companies: {
    description: "Partners, clients, and organizations I've collaborated with",
    href: "/companies",
    icon: "mdi:domain",
    label: "Network",
    order: 5,
    tagTitle: "Industry",
  },
  contact: {
    description: "Get in touch",
    href: "/contact",
    icon: "mdi:email",
    label: "Contact",
    order: 5,
    tagTitle: "Contact",
  },
  experience: {
    description: "Discover my career journey across fintech, betting, and logistics",
    href: "/experience",
    icon: "mdi:briefcase-outline",
    label: "Experience",
    order: 3,
    tagTitle: "Skills",
  },
  home: {
    description: "Start your journey through my professional portfolio and recent work",
    href: "/",
    icon: "mdi:home-variant-outline",
    label: "Home",
    order: 1,
    tagTitle: "Context",
  },
  projects: {
    description: "Explore cutting-edge solutions built with modern technologies",
    href: "/projects",
    icon: "mdi:console",
    label: "Projects",
    order: 2,
    tagTitle: "Technologies",
  },
} as const satisfies Record<string, NavItem>;

export const NAV_ITEMS_ARRAY = Object.values(NAV_ITEMS).sort((a, b) => a.order - b.order);

export const SOCIALS = [
  {
    handle: "@pavstev",
    href: "https://github.com/pavstev",
    icon: "mdi:github",
    name: "GitHub",
  },
  {
    handle: "stevanpavlovic",
    href: "https://linkedin.com/in/stevanpavlovic",
    icon: "mdi:linkedin",
    name: "LinkedIn",
  },
  {
    handle: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
    icon: "mdi:email",
    name: "Email",
  },
] as const;

export const ITEMS_PER_PAGE = 10;
