import { cn } from "@client/utils";
import * as React from "react";

export const Card = ({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn(
      "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
      className
    )}
    data-slot="card"
    {...props}
  />
);

export const CardAction = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
    data-slot="card-action"
    {...props}
  />
);

export const CardContent = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div className={cn("px-6", className)} data-slot="card-content" {...props} />
);

export const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn("text-sm text-muted-foreground", className)}
    data-slot="card-description"
    {...props}
  />
);

export const CardFooter = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
    data-slot="card-footer"
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn(
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
      className
    )}
    data-slot="card-header"
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div className={cn("leading-none font-semibold", className)} data-slot="card-title" {...props} />
);
