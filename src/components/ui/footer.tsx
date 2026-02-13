"use client";

import type React from "react";
import type { ReactNode } from "react";

import { Logo } from "@components/logo";
import { Button } from "@components/ui/button";
import { FacebookIcon, Github, Instagram, Linkedin, Mail, Twitter, Youtube } from "lucide-react";
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
  <footer className="relative w-full overflow-hidden border-t border-white/5 bg-black pt-16 pb-8 text-neutral-200 backdrop-blur-3xl md:pt-20">
    <div className="absolute inset-0 z-0 size-full bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)] opacity-20" />
    <div className="absolute inset-0 z-0 size-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:24px_24px]" />

    <div className="relative z-10 mx-auto max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <AnimatedContainer delay={0.1}>
            <div className="flex items-center gap-2">
              <Logo className="text-white" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              {PROFILE.bio.split(". ")[0]}. Architecting the future of distributed systems with
              precision and elegance.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((link) => {
                const IconComp = getSocialIcon(link.name);
                return (
                  <a
                    className="group relative flex size-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50 text-neutral-400 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
                    href={link.href}
                    key={link.name}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <IconComp className="size-4" />
                    <span className="sr-only">{link.name}</span>
                  </a>
                );
              })}
            </div>
          </AnimatedContainer>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:pl-12">
          {footerLinkGroups.map((group, index) => (
            <AnimatedContainer delay={0.2 + index * 0.1} key={group.label}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                {group.label}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.title}>
                    <a
                      className="group inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
                      href={link.href}
                    >
                      <span>{link.title}</span>
                      <span className="block h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedContainer>
          ))}
        </div>
      </div>

      <div className="mt-16 border-t border-white/5 pt-8">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {PROFILE.name}. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a className="transition-colors hover:text-white" href="/privacy">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-white" href="/terms">
              Terms of Service
            </a>
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
    links: [{ href: NAV_ITEMS.companies.href, title: NAV_ITEMS.companies.label }],
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
