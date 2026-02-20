import type { FC } from "react";

import { buttonVariants } from "@components/ui/button.tsx";
import { Icon } from "@components/ui/icon.tsx";

interface BackButtonProps {
  href: string;
  label: string;
}

export const BackButton: FC<BackButtonProps> = ({ href, label }) => (
  <a
    className={buttonVariants({ className: "gap-1 pl-2.5", size: "sm", variant: "ghost" })}
    href={href}
  >
    <Icon className="size-4" name="mdi:chevron-left" />
    {label}
  </a>
);