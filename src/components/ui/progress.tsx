import { cn } from "@client/utils";
import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";

export const Progress = ({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>): React.JSX.Element => {
  return (
    <ProgressPrimitive.Root
      className={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)}
      data-slot="progress"
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="bg-primary size-full flex-1 transition-all"
        data-slot="progress-indicator"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};
