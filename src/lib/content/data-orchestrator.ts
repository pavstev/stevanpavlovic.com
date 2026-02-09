import type { ImageMetadata } from "astro";

import { getCollection } from "astro:content";

import type { CardData } from "../../components/organisms/card.astro";
import type { ContentAdapter } from "./adapter";
import type { CollectionItem, CollectionKey, ViewPageProps } from "./types";

import { PROFILE } from "../../config";
import { createAuthorItem } from "./helpers";
import { adapters } from "./registry";

const getSortDate = (item: CollectionItem): number => {
  const adapter = adapters[item.collection] as unknown as ContentAdapter<CollectionKey>;
  return adapter ? adapter.getSortDate(item) : 0;
};

export const getCollectionData = async <CN extends CollectionKey>(collection: CN): Promise<CollectionItem<CN>[]> => {
  const allItems = await getCollection(collection);
  const mappedItems: CollectionItem<CN>[] = allItems.map((item) => ({
    body: item.body,
    collection,
    data: item.data,
    id: item.id,
  }));
  return mappedItems.sort((a, b) => getSortDate(b) - getSortDate(a));
};

export const getViewPageProps = async (item: CollectionItem): Promise<ViewPageProps> => {
  const adapter = adapters[item.collection] as unknown as ContentAdapter<CollectionKey>;

  // console.log({adapters: Object.keys(adapters), item,} )
  if (!adapter) {
    throw new Error(`No adapter found for collection: ${item.collection}`);
  }

  const props = await adapter.getViewProps(item);
  const toolbarItems = await adapter.getToolbarItems(item);
  const author = createAuthorItem(PROFILE);

  const data = item.data as Record<string, unknown>;
  const defaultTitle = (data.title || data.name || data.role || "") as string;
  const defaultImage = (data.image || data.logo || data.avatar) as ImageMetadata | string | undefined;

  return {
    author, // Ensure author provided if needed by template
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
  } as ViewPageProps;
};

export const getItemCardProps = async (
  item: CollectionItem,
): Promise<{
  actionLabel: string;
  data: CardData;
}> => {
  const adapter = adapters[item.collection] as unknown as ContentAdapter<CollectionKey>;

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
