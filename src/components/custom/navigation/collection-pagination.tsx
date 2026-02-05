import type { FC } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";

interface CollectionPaginationProps {
  baseUrl: string;
  currentPage: number;
  nextUrl?: string;
  prevUrl?: string;
  totalPages: number;
}

export const CollectionPagination: FC<CollectionPaginationProps> = ({
  baseUrl,
  currentPage,
  nextUrl,
  prevUrl,
  totalPages,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {prevUrl ? (
              <PaginationPrevious href={prevUrl} />
            ) : (
              <PaginationPrevious className="pointer-events-none opacity-50" href="#" />
            )}
          </PaginationItem>
          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href={`${baseUrl}${i === 0 ? "" : `/${i + 1}`}`}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            {nextUrl ? (
              <PaginationNext href={nextUrl} />
            ) : (
              <PaginationNext className="pointer-events-none opacity-50" href="#" />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
