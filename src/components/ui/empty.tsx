import { cn } from "@client/utils";
import { cva, type VariantProps } from "class-variance-authority";

export const Empty = ({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
      className
    )}
    data-slot="empty"
    {...props}
  />
);

export const EmptyHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn("flex max-w-2xl flex-col items-center gap-2 text-center", className)}
    data-slot="empty-header"
    {...props}
  />
);

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
      },
    },
  }
);

export const EmptyMedia = ({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>): React.JSX.Element => (
  <div
    className={cn(emptyMediaVariants({ className, variant }))}
    data-slot="empty-icon"
    data-variant={variant}
    {...props}
  />
);

export const EmptyTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn("text-lg font-medium tracking-tight", className)}
    data-slot="empty-title"
    {...props}
  />
);

export const EmptyDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element => (
  <div
    className={cn(
      "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
      className
    )}
    data-slot="empty-description"
    {...props}
  />
);

export const EmptyContent = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    className={cn(
      "flex w-full max-w-2xl min-w-0 flex-col items-center gap-4 text-sm text-balance",
      className
    )}
    data-slot="empty-content"
    {...props}
  />
);
