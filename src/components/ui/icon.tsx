import type { IconProps as IconifyProps } from "@iconify/react";

import { cn } from "@client/utils";
import { Icon as Iconify } from "@iconify/react";

interface IconProps extends Omit<IconifyProps, "icon"> {
  name: string;
}

export const Icon = ({ className, name, ...props }: IconProps): React.JSX.Element => (
  <Iconify className={cn("size-4 shrink-0", className)} icon={name} {...props} />
);
