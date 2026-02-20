"use client";

import { cn } from "@client/utils.ts";
import { Label as LabelPrimitive } from "radix-ui";
import { type ComponentProps, type JSX } from "react";

export const Label = ({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>): JSX.Element => (
  <LabelPrimitive.Root
    className={cn(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    data-slot="label"
    {...props}
  />
);