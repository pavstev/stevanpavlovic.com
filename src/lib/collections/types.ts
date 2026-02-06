import type { ImageMetadata } from "astro";
import type { CollectionEntry, CollectionKey } from "astro:content";

import type { Author, ToolbarItem } from "./toolbar-items";

export type { ToolbarItem };

import { collections as baseCollections } from "../../content.config";

const DISALLOWED_COLLECTIONS = [] as const;

export const collections: CollectionKey[] = Object.keys(baseCollections).filter(
  (c) => !DISALLOWED_COLLECTIONS.includes(c as never),
) as CollectionKey[];

export interface CollectionItem<CN extends CollectionKey> {
  body?: string;
  collection: CN;
  data: CollectionEntry<CN>["data"];
  id: string;
}

export type Nullable<T> = null | T | undefined;

export type Person = CollectionEntry<"people">["data"];

export interface PostLink {
  href: string;
  label: string;
}
export type Tag = CollectionEntry<"tags">["data"];

export interface ViewPageProps {
  author?: Author;
  backLink: PostLink;
  description: string | undefined;
  image?: ImageMetadata;
  subtitle: string | undefined;
  tags: ViewPagePropsTags;
  title: string;
  toolbarItems: (ToolbarItem | undefined)[];
}

export interface ViewPagePropsTags {
  items: Tag[];
  title: string | undefined;
}
