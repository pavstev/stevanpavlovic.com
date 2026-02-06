import { type CollectionEntry, getCollection } from "astro:content";

import type { CollectionItem, CollectionKey } from "./types";

import { getSortDate } from "./sorting";

export const getCollectionData = async <CN extends CollectionKey>(collection: CN): Promise<CollectionItem<CN>[]> => {
  const allItems = await getCollection(collection);

  const mappedItems: CollectionItem<CN>[] = allItems.map((item) => ({
    collection,
    data: item.data as CollectionEntry<CN>["data"],
    id: item.id,
  }));

  return mappedItems.sort((a, b) => getSortDate(b) - getSortDate(a));
};
