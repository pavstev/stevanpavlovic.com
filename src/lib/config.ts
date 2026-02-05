import profileImage from "../assets/profile.jpeg";

export const SITE_CONFIG = {
  author: "Stevan Pavlovic",
  description: "Technical Lead and Senior Software Engineer",
  email: "hi@stevanpavlovic.com",
  tagline: "a software engineer focused on distributed systems and backend architecture",
  title: "Stevan Pavlovic - Senior Software Engineer",
} as const;

export const NAV_ITEMS = [
  {
    color: "var(--color-primary)",
    description: "Start your journey through my professional portfolio and recent work",
    href: "/",
    icon: "mdi:home-variant-outline",
    label: "Home",
  },
  {
    color: "var(--color-primary)",
    description: "Explore cutting-edge solutions built with modern technologies",
    href: "/projects/list",
    icon: "mdi:console",
    label: "Projects",
  },
  {
    color: "var(--color-primary)",
    description: "Discover my career journey across fintech, betting, and logistics",
    href: "/experience/list",
    icon: "mdi:briefcase-outline",
    label: "Experience",
  },
  {
    color: "var(--color-accent)",
    description: "Read insights on distributed systems and software architecture",
    href: "/blog/grid",
    icon: "mdi:newspaper-variant-outline",
    label: "Blog",
  },
] as const;

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

export interface Stat {
  format?: "compact" | "plain";
  icon: `mdi:${string}`;
  label: string;
  unit?: string;
  value: number;
}

export const STATS: Stat[] = [
  { icon: "mdi:clock-time-eight-outline", label: "Years Exp.", value: 12 },
  { icon: "mdi:server-network", label: "Systems", value: 24 },
  { format: "compact", icon: "mdi:account-group-outline", label: "Users", unit: "+", value: 120000 },
  { icon: "mdi:earth", label: "Countries", value: 15 },
] as const;
