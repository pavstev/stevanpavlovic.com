import type { CollectionKey } from "astro:content";

import { getCollection } from "astro:content";

import type { CardData, CollectionItem, CollectionPageData, ViewPageProps } from "./types";

import { ITEMS_PER_PAGE, PROFILE } from "../config";
import { createAuthorItem } from "./helpers";
import { adapters } from "./registry";
import { buildPaginationUrls, getCollectionConfig, getPageItems } from "./utils";

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
  const defaultTitle = (data.title ?? data.name ?? data.role ?? "") as string;
  const defaultImage = (data.image ?? data.logo ?? data.avatar) as
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

const getItemCardProps = async <CN extends CollectionKey>(
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
    actionLabel: result.actionLabel ?? "View",
    data: result.data,
  };
};

export const getCollectionPageData = async (
  collection: CollectionKey,
  page: number | string
): Promise<CollectionPageData> => {
  const currentPage = typeof page === "string" ? parseInt(page, 10) : page;

  const sortedItems = await getCollectionData(collection);
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const items = getPageItems(sortedItems, currentPage);

  const config = getCollectionConfig(collection);
  const baseUrl = `/${collection}`;
  const { nextUrl, prevUrl } = buildPaginationUrls(collection, currentPage, totalPages);

  return {
    baseUrl,
    collectionItems: items,
    collectionKey: collection,
    config,
    containerId: `${collection}-container`,
    currentPage,
    getItemCardProps,
    initialPageSize: 20,
    nextUrl,
    prevUrl,
    totalItems,
    totalPages,
  };
};
