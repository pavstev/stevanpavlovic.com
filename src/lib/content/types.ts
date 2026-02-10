import type { ImageMetadata } from "astro";

import type {
  CollectionEntry,
  CollectionKey,
  PostLink,
  Tag,
  ToolbarItem,
  ViewPagePropsTags,
} from "../types";

export type { CollectionEntry, CollectionKey, Tag, ToolbarItem, ViewPagePropsTags };

export interface Author extends ToolbarItem {
  avatar: ImageMetadata;
  name: string;
  role: string;
  type: "person";
}

export interface CollectionItem<CN extends CollectionKey = CollectionKey> {
  body?: string;
  collection: CN;
  data: CollectionEntry<CN>["data"];
  id: string;
}

export type Company = CollectionEntry<"companies">["data"];
export type Nullable<T> = null | T | undefined;

export interface ViewPageProps<_CN extends CollectionKey = CollectionKey> {
  author?: Author;
  backLink: PostLink;
  description: string | undefined;
  image?: ImageMetadata | string;
  subtitle: string | undefined;
  tags: ViewPagePropsTags;
  title: string;
  toolbarItems: (ToolbarItem | undefined)[];
}
