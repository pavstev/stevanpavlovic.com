import profileImage from "../assets/profile.jpeg";

export const SITE_CONFIG = {
  author: "Stevan Pavlovic",
  description: "Technical Lead and Senior Software Engineer",
  email: "hi@stevanpavlovic.com",
  hero: {
    tagline: "a software engineer focused on distributed systems and backend architecture",
    title: {
      highlight: "Software",
      main: "Crafting",
    },
  },
  title: "Stevan Pavlovic - Senior Software Engineer",
} as const;

export const NAV_ITEMS = [
  {
    color: "var(--color-primary)",
    href: "/",
    icon: "mdi:home-variant-outline",
    label: "Home",
  },
  {
    color: "var(--color-primary)",
    href: "/projects",
    icon: "mdi:console",
    label: "Projects",
  },
  {
    color: "var(--color-secondary)",
    href: "/experience",
    icon: "mdi:briefcase-outline",
    label: "Experience",
  },
  {
    color: "var(--color-accent)",
    href: "/blog",
    icon: "mdi:newspaper-variant-outline",
    label: "Blog",
  },
  {
    color: "var(--color-destructive)",
    href: "/playground",
    icon: "mdi:flask-outline",
    label: "Playground",
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
