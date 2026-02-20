import { cn } from "@client/utils.ts";
import { Separator as SeparatorPrimitive } from "radix-ui";
import { type ComponentProps, type JSX } from "react";

export const Separator = ({
  className,
  decorative = true,
  orientation = "horizontal",
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>): JSX.Element => (
  <SeparatorPrimitive.Root
    className={cn(
      "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
      className
    )}
    data-slot="separator"
    decorative={decorative}
    orientation={orientation}
    {...props}
  />
);
