import type { ComponentProps, FC } from "react";

import { cn } from "@client/utils";

export const Skeleton: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    className={cn("bg-accent animate-pulse rounded-md", className)}
    data-slot="skeleton"
    {...props}
  />
);