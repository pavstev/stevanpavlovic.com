"use client";

import type React from "react";

import { Icon } from "@components/ui/icon";
import { Logo } from "@components/ui/logo";
import { motion, useReducedMotion } from "framer-motion";

import { NAV_ITEMS, PROFILE, SOCIALS } from "../../config";

type FooterLink = {
  href: string;
  title: string;
};

type FooterLinkGroup = {
  label: string;
  links: FooterLink[];
};

export const Footer: React.FC = (): React.JSX.Element => (
  <footer className="relative w-full border-t border-white/5 bg-black py-8 text-neutral-200 backdrop-blur-3xl">
    <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)] opacity-10" />

    <div className="relative z-10 mx-auto max-w-5xl px-4">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="flex flex-col gap-4">
          <AnimatedContainer delay={0.1}>
            <div className="flex items-center gap-2">
              <Logo className="text-white" />
            </div>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              {PROFILE.role} • {PROFILE.location}
            </p>
          </AnimatedContainer>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-6">
          {footerLinkGroups.map((group, index) => (
            <AnimatedContainer delay={0.2 + index * 0.1} key={group.label}>
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-white uppercase opacity-50">
                {group.label}
              </h3>
              <ul className="flex flex-col gap-2 md:flex-row md:gap-6">
                {group.links.map((link) => (
                  <li key={link.title}>
                    <a
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                      href={link.href}
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedContainer>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-neutral-500 md:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {PROFILE.name}.
        </p>
        <div className="flex items-center gap-4">
          {SOCIALS.map((link) => (
            <a
              className="text-neutral-400 transition-colors hover:text-white"
              href={link.href}
              key={link.name}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon className="size-4" name={link.icon} />
              <span className="sr-only">{link.name}</span>
            </a>
          ))}
        </div>
        <div className="flex gap-4">
          <a className="hover:text-white" href="/privacy">
            Privacy
          </a>
          <a className="hover:text-white" href="/terms">
            Terms
          </a>
        </div>
      </div>
    </div>
  </footer>
);

const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: "Explore",
    links: [
      { href: NAV_ITEMS.projects.href, title: NAV_ITEMS.projects.label },
      { href: NAV_ITEMS.experience.href, title: NAV_ITEMS.experience.label },
      { href: NAV_ITEMS.blog.href, title: NAV_ITEMS.blog.label },
    ],
  },
  {
    label: "Connect",
    links: [
      { href: "/contact", title: "Contact" },
      { href: "/rss.xml", title: "RSS Feed" },
    ],
  },
];

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode;
  delay?: number;
};

export const AnimatedContainer = ({
  children,
  delay = 0.1,
  ...props
}: AnimatedContainerProps): React.JSX.Element => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
