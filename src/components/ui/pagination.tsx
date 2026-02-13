import { cn } from "@client/utils";
import { type Button, buttonVariants } from "@components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import * as React from "react";

type PaginationLinkProps = Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a"> & {
    isActive?: boolean;
  };

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    data-slot="pagination"
    role="navigation"
    {...props}
  />
);

const PaginationContent = ({ className, ...props }: React.ComponentProps<"ul">) => (
  <ul
    className={cn("flex flex-row items-center gap-1", className)}
    data-slot="pagination-content"
    {...props}
  />
);

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex size-9 items-center justify-center", className)}
    data-slot="pagination-ellipsis"
    {...props}
  >
    <MoreHorizontalIcon className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
);

const PaginationItem = ({ ...props }: React.ComponentProps<"li">) => (
  <li data-slot="pagination-item" {...props} />
);

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
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

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
    size="default"
    {...props}
  >
    <span className="hidden sm:block">Next</span>
    <ChevronRightIcon />
  </PaginationLink>
);

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
    size="default"
    {...props}
  >
    <ChevronLeftIcon />
    <span className="hidden sm:block">Previous</span>
  </PaginationLink>
);

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
