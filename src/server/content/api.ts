import type { CollectionKey } from "astro:content";

import { getCollection } from "astro:content";

import type {
  CardData,
  CollectionItem,
  CollectionPageData,
  DisplayMode,
  PaginationLinksOptions,
  PaginationType,
  ViewPageProps,
} from "../types";
export type { DisplayMode, PaginationType };
import { ITEMS_PER_PAGE, PROFILE } from "../../config";
import { createAuthorItem } from "./helpers";
import { adapters } from "./registry";
import { buildDisplayUrls, buildPaginationUrls, getCollectionConfig, getPageItems } from "./utils";

const getSortDate = <CN extends CollectionKey>(item: CollectionItem<CN>): number => {
  const adapter = adapters[item.collection];
  return adapter ? adapter.getSortDate(item) : 0;
};

export const getCollectionData = async <CN extends CollectionKey>(
  collection: CN
): Promise<CollectionItem<CN>[]> => {
  const allItems = await getCollection(collection);
  const mappedItems: CollectionItem<CN>[] = allItems.map((item) => ({
    body: item.body,
    collection,
    data: item.data,
    id: item.id,
  }));
  return mappedItems.sort((a, b) => getSortDate(b) - getSortDate(a));
};

export const getViewPageProps = async <CN extends CollectionKey>(
  item: CollectionItem<CN>
): Promise<ViewPageProps> => {
  const adapter = adapters[item.collection];

  if (!adapter) {
    throw new Error(`No adapter found for collection: ${item.collection}`);
  }

  const props = await adapter.getViewProps(item);
  const toolbarItems = await adapter.getToolbarItems(item);
  const author = createAuthorItem(PROFILE);

  const data = item.data as Record<string, unknown>;
  const defaultTitle = (data.title || data.name || data.role || "") as string;
  const defaultImage = (data.image || data.logo || data.avatar) as
    | ImageMetadata
    | string
    | undefined;

  return {
    author,
    backLink: {
      href: `/${item.collection}`,
      label: `Back to ${item.collection.charAt(0).toUpperCase() + item.collection.slice(1)}`,
    },
    description: "",
    image: defaultImage,
    subtitle: undefined,
    tags: { items: [], title: "Tags" },
    title: defaultTitle,
    toolbarItems: [author, ...toolbarItems].filter(Boolean),
    ...props,
  };
};

export const getItemCardProps = async <CN extends CollectionKey>(
  item: CollectionItem<CN>
): Promise<{
  actionLabel: string;
  data: CardData;
}> => {
  const adapter = adapters[item.collection];

  if (!adapter) {
    return {
      actionLabel: "View",
      data: {
        title: item.id,
        url: `/${item.collection}/${item.id}`,
      },
    };
  }

  const result = await adapter.getCardData(item);

  return {
    actionLabel: result.actionLabel || "View",
    data: result.data,
  };
};

export const getCollectionPageData = async (
  collection: CollectionKey,
  page: number | string,
  displayMode: DisplayMode = "list"
): Promise<CollectionPageData> => {
  const currentPage = typeof page === "string" ? parseInt(page, 10) : page;

  const sortedItems = await getCollectionData(collection);
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const items = getPageItems(sortedItems, currentPage);

  const config = getCollectionConfig(collection);
  const baseUrl = `/${collection}`;
  const displayUrls = buildDisplayUrls(collection, currentPage);
  const { nextUrl, prevUrl } = buildPaginationUrls(
    collection,
    displayMode,
    currentPage,
    totalPages
  );

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

export const buildListUrl = (
  currentUrl: URL,
  paginationType: PaginationType,
  path: string,
  paramsToSet: Record<string, number | string | undefined> = {}
): string => {
  const url = new URL(path, currentUrl.origin);
  const currentParams = currentUrl.searchParams;

  for (const [key, value] of currentParams.entries()) {
    if (paginationType === "path" && key === "page") {
      continue;
    }
    url.searchParams.set(key, value);
  }

  for (const [key, value] of Object.entries(paramsToSet)) {
    if (value === undefined || value === null) {
      url.searchParams.delete(key);
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return url.pathname + url.search;
};

export const getPaginationLinks = ({
  baseUrl,
  currentPage,
  currentUrl,
  customGetPageUrl,
  nextUrl,
  paginationType,
  prevUrl,
  totalPages,
}: PaginationLinksOptions): {
  nextLink: string | undefined;
  prevLink: string | undefined;
} => {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  const getPageUrl = (p: number): string => {
    if (customGetPageUrl) {
      return customGetPageUrl(p);
    }

    if (paginationType === "query") {
      return buildListUrl(currentUrl, paginationType, cleanBaseUrl, {
        page: p,
      });
    }

    return p === 1 ? cleanBaseUrl : `${cleanBaseUrl}/${p.toString()}`;
  };

  const resolveLink = (p: number): string => {
    const base = getPageUrl(p);
    if (base.includes("?")) {
      return base;
    }
    return buildListUrl(currentUrl, paginationType, base);
  };

  const nextLink = nextUrl
    ? buildListUrl(currentUrl, paginationType, nextUrl)
    : currentPage < totalPages
      ? resolveLink(currentPage + 1)
      : undefined;

  const prevLink = prevUrl
    ? buildListUrl(currentUrl, paginationType, prevUrl)
    : currentPage > 1
      ? resolveLink(currentPage - 1)
      : undefined;

  return { nextLink, prevLink };
};
