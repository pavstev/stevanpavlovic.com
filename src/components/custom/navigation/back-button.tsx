import type { FC } from "react";

import { buttonVariants } from "@components/ui/button";
import { Icon } from "@components/ui/icon";

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
