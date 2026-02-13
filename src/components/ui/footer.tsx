"use client";

import type React from "react";
import type { ReactNode } from "react";

import { Logo } from "@components/logo";
import { Button } from "@components/ui/button";
import { Icon } from "astro-icon/components"; // Using Icon from astro-icon but inside React? No, astro-icon is for .astro files mostly.
import { FacebookIcon, Github, Instagram, Linkedin, Mail, Twitter, Youtube } from "lucide-react";
// Actually, for React components, we usually use lucide-react or similar.
// The existing footer uses lucide-react.
// But config.ts uses "mdi:..." strings which are for astro-icon.
// If I use config.ts in React, I need to render icons from those strings.
// I can use @iconify/react for React.
// Let's check package.json for @iconify/react.
// package.json has "@iconify-json/mdi", "astro-icon", "lucide-react".
// It does NOT have @iconify/react.
// So I should probably map the "mdi:..." strings to something else or just install @iconify/react if I can.
// Or I can just use the social links from config but map them to Lucide icons if I can, OR just use the hardcoded icons for now if config strings are incompatible.
// Wait, the user wants "carefully".
// Let's look at `src/components/ui/header.tsx`. It uses `NAV_ITEMS_ARRAY` but doesn't render icons for them (except `MobileNav` might).
// `src/components/layout/footer.astro` uses `<Icon name={social.icon} />` which works in Astro.
// In React, I can't use `astro-icon/components` directly easily?
// Actually I can use `@iconify/react` if I install it. But I can't install new packages without asking?
// I should probably just use the existing `lucide-react` icons and maybe map them manually for now, OR better,
// use the `Icon` component if it works in React?
// `astro-icon` documentation says it supports React?
// "The Icon component is an Astro component...". So no.
//
// Plan B: Use `lucide-react` for the static parts, and for the dynamic parts (socials),
// either map the `mdi` names to Lucide, or just stick to Lucide icons for known socials.
// The `SOCIALS` config has: GitHub, LinkedIn, Email.
// The `footer.tsx` has: Facebook, Instagram, Youtube, LinkedIn.
// I should use `SOCIALS` from config.
// `SOCIALS` has `icon: "mdi:github"`.
// I can import `Github`, `Linkedin`, `Mail` from `lucide-react` and map them.
//
// OR, I can use a helper to render icon by name if I have one?
// `src/components/ui/icon.tsx` does not exist.
//
// Let's check `package.json` again.
// It has `lucide-react`.
//
// I will just use `lucide-react` and map the commonly used icons, or simplified approach.
//
// Wait, `sidebar.tsx` was huge (21kb). Maybe it has an icon helper?
//
// Let's just hardcode the icons for `SOCIALS` inside the component for now, using Lucide, matching the config `SOCIALS` order/items if possible?
// `SOCIALS` are: GitHub, LinkedIn, Email.
//
// `col-span-1` etc.
//
// I'll update the component structure.
import { motion, useReducedMotion } from "motion/react";

import { NAV_ITEMS, PROFILE, SOCIALS } from "../../config";

type FooterLink = {
  href: string;
  icon?: ReactNode;
  title: string;
};

type FooterLinkGroup = {
  label: string;
  links: FooterLink[];
};

export const Footer = () => (
  <footer
    className="relative h-[--footer-height] w-full border-t border-transparent transition-all duration-300 ease-in-out [--footer-height:520px]"
    style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
  >
    <div className="relative h-[--footer-height] w-full">
      <div className="sticky top-[calc(100vh-var(--footer-height))] h-full overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate z-0 opacity-50 contain-strict dark:opacity-60"
        >
          <div className="absolute top-0 left-0 h-[320px] w-[560px] -translate-y-[87.5px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,var(--color-primary)/.06_0,hsla(0,0%,55%,.02)_50%,var(--color-primary)/.01_80%)] blur-3xl transition-all duration-500 ease-in-out" />
          <div className="absolute top-0 left-0 h-[320px] w-[240px] [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-accent)/.04_0,var(--color-accent)/.01_80%,transparent_100%)] blur-3xl transition-all duration-500 ease-in-out" />
          <div className="absolute top-0 left-0 h-[320px] w-[240px] -translate-y-[87.5px] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-accent)/.04_0,var(--color-accent)/.01_80%,transparent_100%)] blur-3xl transition-all duration-500 ease-in-out" />
        </div>
        <div className="relative mx-auto flex size-full max-w-6xl flex-col justify-between gap-5">
          <div className="grid grid-cols-1 gap-8 px-4 pt-12 md:grid-cols-2 lg:grid-cols-4">
            <AnimatedContainer className="w-full space-y-4">
              <Logo className="h-5" />
              <p className="mt-8 text-sm text-muted-foreground md:mt-0">
                {PROFILE.bio.split(". ")[0]}.
              </p>
              <div className="flex gap-2">
                {SOCIALS.map((link, index) => {
                  const IconComp = getSocialIcon(link.name);
                  return (
                    <Button
                      asChild
                      key={`social-${link.href}-${index}`}
                      size="icon-sm"
                      variant="outline"
                    >
                      <a href={link.href} rel="noopener noreferrer" target="_blank">
                        <IconComp className="size-4" />
                        <span className="sr-only">{link.name}</span>
                      </a>
                    </Button>
                  );
                })}
              </div>
            </AnimatedContainer>
            {footerLinkGroups.map((group, index) => (
              <AnimatedContainer className="w-full" delay={0.1 + index * 0.1} key={group.label}>
                <div className="mb-10 md:mb-0">
                  <h3 className="text-sm font-semibold tracking-wider uppercase">{group.label}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-xs lg:text-sm">
                    {group.links.map((link) => (
                      <li key={link.title}>
                        <a
                          className="inline-flex items-center transition-colors hover:text-primary [&_svg]:me-1 [&_svg]:size-4"
                          href={link.href}
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-2 border-t border-border/50 p-4 text-sm text-muted-foreground md:flex-row">
            <p>
              &copy; {new Date().getFullYear()} {PROFILE.name}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a className="transition-colors hover:text-foreground" href="/privacy">
                Privacy Policy
              </a>
              <a className="transition-colors hover:text-foreground" href="/terms">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

// Helper to map config social names to Lucide icons
const getSocialIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "email":
      return Mail;
    case "facebook":
      return FacebookIcon;
    case "github":
      return Github;
    case "instagram":
      return Instagram;
    case "linkedin":
      return Linkedin;
    case "twitter":
      return Twitter;
    case "x":
      return Twitter;
    case "youtube":
      return Youtube;
    default:
      return Mail;
  }
};

const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: "Explore",
    links: [
      { href: NAV_ITEMS.home.href, title: NAV_ITEMS.home.label },
      { href: NAV_ITEMS.projects.href, title: NAV_ITEMS.projects.label },
      { href: NAV_ITEMS.experience.href, title: NAV_ITEMS.experience.label },
      { href: NAV_ITEMS.blog.href, title: NAV_ITEMS.blog.label },
    ],
  },
  {
    label: "Network",
    links: [
      { href: NAV_ITEMS.companies.href, title: NAV_ITEMS.companies.label },
      { href: NAV_ITEMS.people.href, title: NAV_ITEMS.people.label },
      { href: NAV_ITEMS.locations.href, title: NAV_ITEMS.locations.label },
      { href: NAV_ITEMS.recommendations.href, title: NAV_ITEMS.recommendations.label },
    ],
  },
  {
    label: "Connect",
    links: [
      { href: "/contact", title: "Contact" },
      { href: "/rss.xml", title: "RSS Feed" },
      { href: "/sitemap-index.xml", title: "Sitemap" },
    ],
  },
];

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode;
  delay?: number;
};

const AnimatedContainer = ({ children, delay = 0.1, ...props }: AnimatedContainerProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", opacity: 0, translateY: -8 }}
      transition={{ delay, duration: 0.8 }}
      viewport={{ once: true }}
      whileInView={{ filter: "blur(0px)", opacity: 1, translateY: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
