import type { DisplayMode } from "./lib/list";

import profileImage from "./assets/profile.jpeg";

// ============================================================================
// Site Metadata
// ============================================================================

export const SITE_TITLE = "Astro Blog";
export const SITE_DESCRIPTION = "Welcome to my website!";

export const SITE_CONFIG = {
  author: "Stevan Pavlovic",
  description: "Technical Lead and Senior Software Engineer",
  email: "hi@stevanpavlovic.com",
  tagline: "a software engineer focused on distributed systems and backend architecture",
  title: "Stevan Pavlovic - Senior Software Engineer",
} as const;

// ============================================================================
// Navigation
// ============================================================================

export interface NavItem {
  color: string;
  defaultView: DisplayMode;
  description: string;
  href: string;
  icon: `mdi:${string}`;
  label: string;
  order: number;
  tagTitle: string;
}

export const NAV_ITEMS = {
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
  companies: {
    color: "var(--color-accent)",
    defaultView: "grid",
    description: "Partners, clients, and organizations I've collaborated with",
    href: "/companies",
    icon: "mdi:domain",
    label: "Network",
    order: 5,
    tagTitle: "Industry",
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
  locations: {
    color: "var(--color-primary)",
    defaultView: "list",
    description: "Places I've worked from and professional hubs",
    href: "/locations",
    icon: "mdi:map-marker-radius",
    label: "Locations",
    order: 8,
    tagTitle: "Region",
  },
  people: {
    color: "var(--color-primary)",
    defaultView: "grid",
    description: "Talented individuals and colleagues in my professional network",
    href: "/people",
    icon: "mdi:account-group",
    label: "People",
    order: 6,
    tagTitle: "Role",
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
  recommendations: {
    color: "var(--color-accent)",
    defaultView: "list",
    description: "Endorsements and testimonials from colleagues and clients",
    href: "/recommendations",
    icon: "mdi:star-face",
    label: "Testimonials",
    order: 7,
    tagTitle: "Context",
  },
} as const satisfies Record<string, NavItem>;

export const NAV_ITEMS_ARRAY = Object.values(NAV_ITEMS).sort((a, b) => a.order - b.order);

// ============================================================================
// Personal Profile
// ============================================================================

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

// ============================================================================
// UI / List Settings
// ============================================================================

export const ITEMS_PER_PAGE = 10;

export const VIEW_MODES: { icon: string; label: string; mode: DisplayMode }[] = [
  { icon: "mdi:format-list-bulleted", label: "List", mode: "list" },
  { icon: "mdi:view-column", label: "Grid", mode: "grid" },
];
