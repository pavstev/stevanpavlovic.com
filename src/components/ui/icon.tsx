import type { IconProps as IconifyProps } from "@iconify/react";
import type { FC } from "react";

import { cn } from "@client/utils.ts";
import { Icon as Iconify } from "@iconify/react";

interface IconProps extends Omit<IconifyProps, "icon"> {
  name: string;
}

export const Icon: FC<IconProps> = ({ className, name, ...props }) => (
  <Iconify className={cn("size-4 shrink-0", className)} icon={name} {...props} />
);
