"use client";

import type React from "react";

import { cn } from "@client/utils";
import { ContactDialog } from "@components/contact/contact-dialog";
import { Icon } from "@components/ui/icon";

import { PROFILE, SOCIALS } from "../../config";

export const ContactSection: React.FC = (): React.JSX.Element => (
  <div className="flex flex-col gap-12 py-12 md:py-24">
    <ContactDialog />

    <div className="grid gap-px overflow-hidden rounded-2xl border bg-border/50 sm:grid-cols-2 lg:grid-cols-3">
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
        <span className="font-mono text-sm">{PROFILE.location}</span>
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
                className="size-4 text-muted-foreground group-hover:text-foreground"
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

const ContactInfoBox: React.FC<{
  children: React.ReactNode;
  className?: string;
  description: string;
  icon: string;
  title: string;
}> = ({ children, className, description, icon, title }): React.JSX.Element => (
  <div className={cn("flex flex-col bg-background p-6", className)}>
    <div className="mb-4 flex items-center gap-2 text-muted-foreground">
      <Icon className="size-5" name={icon} />
      <span className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
        {title}
      </span>
    </div>
    <div className="mb-6 flex-1 text-foreground">{children}</div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);
