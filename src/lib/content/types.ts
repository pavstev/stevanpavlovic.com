import type { ImageMetadata } from "astro";
import type { CollectionEntry, CollectionKey } from "astro:content";

export type { CollectionEntry, CollectionKey };
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
export type Location = CollectionEntry<"locations">["data"];
export type Nullable<T> = null | T | undefined;
export type Person = CollectionEntry<"people">["data"];

export interface PostLink {
  href: string;
  label: string;
}

export type Tag = CollectionEntry<"tags">["data"];

export interface ToolbarItem {
  avatar?: ImageMetadata;
  href?: string;
  icon?: string;
  label: string;
  logo?: ImageMetadata;
  type: ToolbarItemType;
  value: string;
}

export type ToolbarItemType =
  | "award"
  | "category"
  | "date"
  | "industry"
  | "link"
  | "location"
  | "organization"
  | "person"
  | "status"
  | "text"
  | "time"
  | "weather";

export interface ViewPageProps {
  author?: Author;
  backLink: PostLink;
  description: string | undefined;
  image?: ImageMetadata | string;
  subtitle: string | undefined;
  tags: ViewPagePropsTags;
  title: string;
  toolbarItems: (ToolbarItem | undefined)[];
}

export interface ViewPagePropsTags {
  items: Tag[];
  title: string | undefined;
}
