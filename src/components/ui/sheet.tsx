"use client";

import { cn } from "@client/utils";
import { Icon } from "@components/ui/icon";
import { Dialog as SheetPrimitive } from "radix-ui";
import { type ComponentProps, type FC, type JSX } from "react";

export const Sheet: FC<ComponentProps<typeof SheetPrimitive.Root>> = ({ ...props }) => (
  <SheetPrimitive.Root data-slot="sheet" {...props} />
);

const SheetClose: FC<ComponentProps<typeof SheetPrimitive.Close>> = ({ ...props }) => (
  <SheetPrimitive.Close data-slot="sheet-close" {...props} />
);

export const SheetContent = ({
  children,
  className,
  showCloseButton = true,
  side = "right",
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & {
  showCloseButton?: boolean;
  side?: "bottom" | "left" | "right" | "top";
}): JSX.Element => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      className={cn(
        "bg-background data-[state=closed]:animate-out data-[state=open]:animate-in fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
        side === "right" &&
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-2xl",
        side === "left" &&
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-2xl",
        side === "top" &&
          "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
        side === "bottom" &&
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
        className
      )}
      data-slot="sheet-content"
      {...props}
    >
      {children}
      {showCloseButton && (
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <Icon className="size-4" name="mdi:close" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
);

export const SheetDescription = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>): JSX.Element => (
  <SheetPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    data-slot="sheet-description"
    {...props}
  />
);

const SheetFooter: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    data-slot="sheet-footer"
    {...props}
  />
);

export const SheetHeader: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-1.5 p-4", className)} data-slot="sheet-header" {...props} />
);

const SheetOverlay = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Overlay>): JSX.Element => (
  <SheetPrimitive.Overlay
    className={cn(
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className
    )}
    data-slot="sheet-overlay"
    {...props}
  />
);

const SheetPortal: FC<ComponentProps<typeof SheetPrimitive.Portal>> = ({ ...props }) => (
  <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
);

export const SheetTitle = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title>): JSX.Element => (
  <SheetPrimitive.Title
    className={cn("text-foreground font-semibold", className)}
    data-slot="sheet-title"
    {...props}
  />
);

const SheetTrigger: FC<ComponentProps<typeof SheetPrimitive.Trigger>> = ({ ...props }) => (
  <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
);