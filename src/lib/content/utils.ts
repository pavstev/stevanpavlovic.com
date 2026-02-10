import type { DisplayMode } from "../list";
import type { CollectionItem, CollectionKey, Nullable } from "../types";

import { ITEMS_PER_PAGE, NAV_ITEMS, type NavItem, PROFILE, SITE_DESCRIPTION, SITE_TITLE } from "../../config";

export const buildPaginationUrls = (
  collection: CollectionKey,
  display: DisplayMode,
  currentPage: number,
  totalPages: number,
): { nextUrl: string | undefined; prevUrl: string | undefined } => {
  const displayParam = display !== "list" ? `?display=${display}` : "";

  const prevUrl =
    currentPage > 1
      ? currentPage === 2
        ? `/${collection}${displayParam}`
        : `/${collection}/page/${(currentPage - 1).toString()}${displayParam}`
      : undefined;

  const nextUrl =
    currentPage < totalPages ? `/${collection}/page/${(currentPage + 1).toString()}${displayParam}` : undefined;

  return { nextUrl, prevUrl };
};

export const buildDisplayUrls = (collection: CollectionKey, currentPage: number): { grid: string; list: string } => {
  const pagePath = currentPage > 1 ? `/page/${currentPage}` : "";
  return {
    grid: `/${collection}${pagePath}?display=grid`,
    list: `/${collection}${pagePath}?display=list`,
  };
};

export const getPageItems = <CN extends CollectionKey>(
  sortedItems: CollectionItem<CN>[],
  pageNum: number,
): CollectionItem<CN>[] => {
  const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return sortedItems.slice(startIndex, endIndex);
};

export const getCollectionConfig = (
  collection: CollectionKey,
): {
  description: string;
  headerDescription: string;
  headerIcon: string;
  headerTitle: string;
  tagTitle: string;
  title: string;
} => {
  const navItem = NAV_ITEMS[collection as keyof typeof NAV_ITEMS] as Nullable<NavItem>;

  if (!navItem) {
    return {
      description: SITE_DESCRIPTION,
      headerDescription: `Browse ${collection}`,
      headerIcon: "mdi:folder-outline",
      headerTitle: collection.charAt(0).toUpperCase() + collection.slice(1),
      tagTitle: "Tags",
      title: `${collection.charAt(0).toUpperCase() + collection.slice(1)} | ${SITE_TITLE}`,
    };
  }

  return {
    description: collection === "blog" ? SITE_DESCRIPTION : `${PROFILE.name} - ${navItem.label}`,
    headerDescription: navItem.description,
    headerIcon: navItem.icon,
    headerTitle: navItem.label,
    tagTitle: navItem.tagTitle,
    title: collection === "blog" ? `Blog | ${SITE_TITLE}` : `${navItem.label} | ${PROFILE.name}`,
  };
};
