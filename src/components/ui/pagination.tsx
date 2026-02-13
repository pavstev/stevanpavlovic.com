import { cn } from "@client/utils";
import { type Button, buttonVariants } from "@components/ui/button";
import { Icon } from "@components/ui/icon";
import * as React from "react";

type PaginationLinkProps = Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a"> & {
    isActive?: boolean;
  };

export const Pagination = ({
  className,
  ...props
}: React.ComponentProps<"nav">): React.JSX.Element => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    data-slot="pagination"
    role="navigation"
    {...props}
  />
);

export const PaginationContent = ({
  className,
  ...props
}: React.ComponentProps<"ul">): React.JSX.Element => (
  <ul
    className={cn("flex flex-row items-center gap-1", className)}
    data-slot="pagination-content"
    {...props}
  />
);

export const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element => (
  <span
    aria-hidden
    className={cn("flex size-9 items-center justify-center", className)}
    data-slot="pagination-ellipsis"
    {...props}
  >
    <Icon className="size-4" name="mdi:dots-horizontal" />
    <span className="sr-only">More pages</span>
  </span>
);

export const PaginationItem = ({ ...props }: React.ComponentProps<"li">): React.JSX.Element => (
  <li data-slot="pagination-item" {...props} />
);

export const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps): React.JSX.Element => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        size,
        variant: isActive ? "outline" : "ghost",
      }),
      className
    )}
    data-active={isActive}
    data-slot="pagination-link"
    {...props}
  />
);

export const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.JSX.Element => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
    size="default"
    {...props}
  >
    <span className="hidden sm:block">Next</span>
    <Icon name="mdi:chevron-right" />
  </PaginationLink>
);

export const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.JSX.Element => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
    size="default"
    {...props}
  >
    <Icon name="mdi:chevron-left" />
    <span className="hidden sm:block">Previous</span>
  </PaginationLink>
);
