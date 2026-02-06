import profileImage from "../assets/profile.jpeg";

export const SITE_CONFIG = {
  author: "Stevan Pavlovic",
  description: "Technical Lead and Senior Software Engineer",
  email: "hi@stevanpavlovic.com",
  tagline: "a software engineer focused on distributed systems and backend architecture",
  title: "Stevan Pavlovic - Senior Software Engineer",
} as const;

export interface NavItem {
  color: string;
  defaultView: "grid" | "list";
  description: string;
  href: string;
  icon: `mdi:${string}`;
  label: string;
  order: number;
  tagTitle: string;
}

export const NAV_ITEMS: Record<string, NavItem> = {
  blog: {
    color: "var(--color-accent)",
    defaultView: "list",
    description: "Read insights on distributed systems and software architecture",
    href: "/blog",
    icon: "mdi:newspaper-variant-outline",
    label: "Blog",
    order: 4,
    tagTitle: "Tags",
  },
  experience: {
    color: "var(--color-primary)",
    defaultView: "list",
    description: "Discover my career journey across fintech, betting, and logistics",
    href: "/experience",
    icon: "mdi:briefcase-outline",
    label: "Experience",
    order: 3,
    tagTitle: "Skills",
  },
  home: {
    color: "var(--color-primary)",
    defaultView: "list",
    description: "Start your journey through my professional portfolio and recent work",
    href: "/",
    icon: "mdi:home-variant-outline",
    label: "Home",
    order: 1,
    tagTitle: "Context",
  },
  projects: {
    color: "var(--color-primary)",
    defaultView: "grid",
    description: "Explore cutting-edge solutions built with modern technologies",
    href: "/projects",
    icon: "mdi:console",
    label: "Projects",
    order: 2,
    tagTitle: "Technologies",
  },
} as const;

export const NAV_ITEMS_ARRAY = Object.values(NAV_ITEMS).sort((a, b) => a.order - b.order);

export const PROFILE = {
  avatar: profileImage,
  bio: "Technical Lead and Senior Software Engineer with over 10 years of experience delivering high-impact solutions for fintech, betting, and logistics sectors. Expert in architecting scalable microservices using Node.js and NestJS, optimizing high-traffic distributed systems, and modernizing legacy infrastructures. Specialized in performance tuning, event-driven architectures (Kafka), and automated DevOps workflows.",
  email: SITE_CONFIG.email,
  location: "Belgrade, Serbia",
  name: SITE_CONFIG.author,
  role: "Senior Software Engineer",
  status: "Open to Opportunities",
} as const;

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

interface Stat {
  format?: "compact" | "plain";
  icon: `mdi:${string}`;
  label: string;
  unit?: string;
  value: number;
}

export const STATS: Stat[] = [
  { icon: "mdi:clock-time-eight-outline", label: "Years Exp.", value: 12 },
  { icon: "mdi:server-network", label: "Systems", value: 24 },
  { format: "compact", icon: "mdi:account-group-outline", label: "Users", unit: "k", value: 120 },
  { icon: "mdi:earth", label: "Countries", value: 15 },
] as const;
