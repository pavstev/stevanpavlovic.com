import { type CollectionKey } from "astro:content";

import { ITEMS_PER_PAGE } from "../config";
import {
  buildDisplayUrls,
  buildPaginationUrls,
  type DisplayMode,
  getCollectionConfig,
  getCollectionData,
  getItemCardProps,
  getPageItems,
} from "./index";

export interface CollectionPageData {
  baseUrl: string;
  collectionItems: ReturnType<typeof getPageItems>;
  collectionKey: CollectionKey;
  config: ReturnType<typeof getCollectionConfig>;
  containerId: string;
  currentPage: number;
  display: DisplayMode;
  displayUrls: ReturnType<typeof buildDisplayUrls>;
  getItemCardProps: typeof getItemCardProps;
  initialPageSize: number;
  nextUrl?: string;
  prevUrl?: string;
  totalItems: number;
  totalPages: number;
}

export const getCollectionPageData = async (
  collection: CollectionKey,
  page: number | string,
  displayMode: DisplayMode = "list",
): Promise<CollectionPageData> => {
  const currentPage = typeof page === "string" ? parseInt(page, 10) : page;

  const sortedItems = await getCollectionData(collection);
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const items = getPageItems(sortedItems, currentPage);

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
