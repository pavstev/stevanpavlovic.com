import type { CollectionItem, CollectionName, DisplayMode } from "./types";

import { ITEMS_PER_PAGE } from "../../config";

export const buildPaginationUrls = (
  collection: CollectionName,
  view: DisplayMode,
  currentPage: number,
  totalPages: number,
): { nextUrl: string | undefined; prevUrl: string | undefined } => {
  const prevUrl =
    currentPage > 1
      ? currentPage === 2
        ? `/${collection}/${view}`
        : `/${collection}/${view}/${(currentPage - 1).toString()}`
      : undefined;

  const nextUrl = currentPage < totalPages ? `/${collection}/${view}/${(currentPage + 1).toString()}` : undefined;

  return { nextUrl, prevUrl };
};

export const buildDisplayUrls = (collection: CollectionName, currentPage: number): { grid: string; list: string } => ({
  grid: currentPage === 1 ? `/${collection}/grid` : `/${collection}/grid/${currentPage.toString()}`,
  list: currentPage === 1 ? `/${collection}/list` : `/${collection}/list/${currentPage.toString()}`,
});

export const getPageItems = <CN extends CollectionName>(
  sortedItems: CollectionItem<CN>[],
  pageNum: number,
): CollectionItem<CN>[] => {
  const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return sortedItems.slice(startIndex, endIndex);
};
