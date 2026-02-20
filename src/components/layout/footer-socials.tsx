"use client";

import type { FC } from "react";

import { Icon } from "@components/ui/icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";

import { SOCIALS } from "../../constants";

export const FooterSocials: FC = () => (
  <TooltipProvider delayDuration={0}>
    <div className="flex items-center gap-4">
      {SOCIALS.map((social) => (
        <Tooltip key={social.name}>
          <TooltipTrigger asChild>
            <a
              aria-label={social.name}
              className="text-muted-foreground hover:text-foreground transition-colors"
              href={social.href}
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="size-5" name={social.icon} />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>{social.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  </TooltipProvider>
);