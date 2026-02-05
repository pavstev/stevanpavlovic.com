"use client";

import type { FC, JSX, ReactNode } from "react";

import { cn } from "@client/utils";
import { Icon } from "@components/ui/icon";

import { SITE_CONFIG, SOCIALS } from "../../../constants";
import { ContactDialog } from "./contact-dialog";

export const ContactSection: FC = () => (
  <div className="flex flex-col items-start gap-12 md:py-12">
    <ContactDialog />

    <div className="bg-border/50 grid w-full gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3">
      <ContactInfoBox
        description="I typically respond within 24 hours."
        icon="mdi:email"
        title="Email"
      >
        <a
          className="font-mono text-sm hover:underline"
          href={`mailto:${SOCIALS.find((s) => s.name === "Email")?.handle}`}
        >
          {SOCIALS.find((s) => s.name === "Email")?.handle}
        </a>
      </ContactInfoBox>

      <ContactInfoBox
        description="Based in Serbia, working globally."
        icon="mdi:map-marker"
        title="Location"
      >
        <span className="font-mono text-sm">{SITE_CONFIG.location}</span>
      </ContactInfoBox>

      <ContactInfoBox
        className="sm:col-span-2 lg:col-span-1"
        description="Follow my work and updates."
        icon="mdi:share-variant"
        title="Socials"
      >
        <div className="flex flex-wrap gap-4">
          {SOCIALS.filter((s) => s.name !== "Email").map((social) => (
            <a
              className="group flex items-center gap-1.5 font-mono text-sm hover:underline"
              href={social.href}
              key={social.name}
            >
              <Icon
                className="text-muted-foreground group-hover:text-foreground size-4"
                name={social.icon}
              />
              {social.name}
            </a>
          ))}
        </div>
      </ContactInfoBox>
    </div>
  </div>
);

const ContactInfoBox: FC<{
  children: ReactNode;
  className?: string;
  description: string;
  icon: string;
  title: string;
}> = ({ children, className, description, icon, title }): JSX.Element => (
  <div className={cn("bg-background flex flex-col p-6", className)}>
    <div className="text-muted-foreground mb-4 flex items-center gap-2">
      <Icon className="size-5" name={icon} />
      <span className="text-foreground text-sm font-bold tracking-tight uppercase">{title}</span>
    </div>
    <div className="text-foreground mb-6 flex-1">{children}</div>
    <p className="text-muted-foreground text-xs">{description}</p>
  </div>
);
