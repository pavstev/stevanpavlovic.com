import type { CollectionKey } from "astro:content";

import type { CardData } from "../../components/organisms/card.astro";
import type { Author, CollectionItem, ToolbarItem, ViewPageProps } from "./types";

import { PROFILE } from "../../config";
import { createAuthorItem } from "./helpers";

export interface CardResult {
  actionLabel?: string;
  data: CardData;
}

export abstract class ContentAdapter<K extends CollectionKey> {
  abstract getCardData(item: CollectionItem<K>): CardResult | Promise<CardResult>;
  getSortDate(_item: CollectionItem<K>): number {
    return 0;
  }
  abstract getToolbarItems(item: CollectionItem<K>): Promise<ToolbarItem[]> | ToolbarItem[];

  abstract getViewProps(item: CollectionItem<K>): Partial<ViewPageProps<K>> | Promise<Partial<ViewPageProps<K>>>;

  protected getAuthor(): Author {
    return createAuthorItem(PROFILE);
  }
}
