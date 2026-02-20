import { cn } from "@client/utils";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { type ComponentProps, type JSX } from "react";

export const Tooltip = ({
  ...props
}: ComponentProps<typeof TooltipPrimitive.Root>): JSX.Element => (
  <TooltipPrimitive.Root data-slot="tooltip" {...props} />
);

export const TooltipContent = ({
  children,
  className,
  sideOffset = 0,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>): JSX.Element => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      className={cn(
        "animate-in bg-foreground text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        className
      )}
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
);

export const TooltipProvider = ({
  delayDuration = 0,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>): JSX.Element => (
  <TooltipPrimitive.Provider
    data-slot="tooltip-provider"
    delayDuration={delayDuration}
    {...props}
  />
);

export const TooltipTrigger = ({
  ...props
}: ComponentProps<typeof TooltipPrimitive.Trigger>): JSX.Element => (
  <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
);