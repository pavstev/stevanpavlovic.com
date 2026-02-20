import { cn } from "@client/utils";
import { type Button, buttonVariants } from "@components/ui/button";
import { Icon } from "@components/ui/icon";
import { type ComponentProps, type FC, type JSX } from "react";

type PaginationLinkProps = ComponentProps<"a"> &
  Pick<ComponentProps<typeof Button>, "size"> & {
    isActive?: boolean;
  };

export const Pagination: FC<ComponentProps<"nav">> = ({ className, ...props }) => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    data-slot="pagination"
    role="navigation"
    {...props}
  />
);

export const PaginationContent: FC<ComponentProps<"ul">> = ({ className, ...props }) => (
  <ul
    className={cn("flex flex-row items-center gap-1", className)}
    data-slot="pagination-content"
    {...props}
  />
);

const PaginationEllipsis: FC<ComponentProps<"span">> = ({ className, ...props }) => (
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

export const PaginationItem: FC<ComponentProps<"li">> = ({ ...props }) => (
  <li data-slot="pagination-item" {...props} />
);

export const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps): JSX.Element => (
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
}: ComponentProps<typeof PaginationLink>): JSX.Element => (
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
}: ComponentProps<typeof PaginationLink>): JSX.Element => (
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