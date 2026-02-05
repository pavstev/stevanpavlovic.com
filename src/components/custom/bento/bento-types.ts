import type { ReactNode } from "react";

export interface BentoItem {
  className?: string;
  code?: string;
  codeLang?: string;
  content?: ReactNode;
  cta?: string;
  description: string;
  feature?:
    | "chart"
    | "code"
    | "counter"
    | "custom"
    | "icons"
    | "metrics"
    | "spotlight"
    | "timeline"
    | "typing";
  featureIcons?: string[];
  href?: string;
  icon?: string;
  id: string;
  image?: string;
  metrics?: Array<{
    color?: string;
    label: string;
    suffix?: string;
    value: number;
  }>;
  size?: "lg" | "md" | "sm";
  spotlightItems?: string[];
  statistic?: {
    end?: number;
    label: string;
    start?: number;
    suffix?: string;
    value: string;
  };
  tags?: string[];
  tagsVariant?: "default" | "list";
  timeline?: Array<{ event: string; year: string }>;
  title: string;
  typingText?: string;
}
