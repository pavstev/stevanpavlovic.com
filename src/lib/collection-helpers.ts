import type { CollectionKey } from "astro:content";

import type { CollectionPageData, DisplayMode } from "./types";

import { ITEMS_PER_PAGE } from "../config";
import {
  buildDisplayUrls,
  buildPaginationUrls,
  getCollectionConfig,
  getCollectionData,
  getItemCardProps,
  getPageItems,
} from "./index";

export const getCollectionPageData = async (
  collection: CollectionKey,
  page: number | string,
  displayMode: DisplayMode = "list",
): Promise<CollectionPageData> => {
  const currentPage = typeof page === "string" ? parseInt(page, 10) : page;

  const sortedItems = await getCollectionData(collection);
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const items = getPageItems(sortedItems, currentPage) as any;

  const config = getCollectionConfig(collection);
  const baseUrl = `/${collection}`;
  const displayUrls = buildDisplayUrls(collection, currentPage);
  const { nextUrl, prevUrl } = buildPaginationUrls(collection, displayMode, currentPage, totalPages);

  return {
    baseUrl,
    collectionItems: items,
    collectionKey: collection,
    config,
    containerId: `${collection}-container`,
    currentPage,
    display: displayMode,
    displayUrls,
    getItemCardProps,
    initialPageSize: 20,
    nextUrl,
    prevUrl,
    totalItems,
    totalPages,
  };
};
