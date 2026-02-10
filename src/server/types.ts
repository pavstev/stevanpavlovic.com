import type { ImageMetadata } from "astro";
import type { CollectionEntry, CollectionKey } from "astro:content";

export interface Author extends ToolbarItem {
  avatar: ImageMetadata;
  name: string;
  role: string;
  type: "person";
}

export abstract class ContentAdapter<CN extends CollectionKey> {
  abstract getCardData(item: CollectionItem<CN>): Promise<CardResult>;
  abstract getSortDate(item: CollectionItem<CN>): number;
  abstract getToolbarItems(item: CollectionItem<CN>): Promise<ToolbarItem[]> | ToolbarItem[];
  abstract getViewProps(
    item: CollectionItem<CN>
  ): Partial<ViewPageProps<CN>> | Promise<Partial<ViewPageProps<CN>>>;
}

export type { CollectionEntry, CollectionKey };

import { collections as baseCollections } from "../content.config";

const DISALLOWED_COLLECTIONS = [] as const;

export const collections: CollectionKey[] = Object.keys(baseCollections).filter(
  (c) => !DISALLOWED_COLLECTIONS.includes(c as never)
) as CollectionKey[];

export interface CardData {
  align?: "center" | "start";
  animate?: boolean;
  date?: Date;
  delay?: number;
  description?: string;
  footerMeta?: string;
  icon?: string;
  image?: ImageMetadata | string;
  logo?: ImageMetadata;
  meta?: string;
  subtitle?: string;
  tags?: Tag[];
  title?: string;
  url?: string;
}

export interface CardResult {
  actionLabel?: string;
  data: CardData;
}

export interface CollectionConfig {
  description: string;
  headerDescription: string;
  headerIcon: string;
  headerTitle: string;
  tagTitle: string;
  title: string;
}

export interface CollectionItem<CN extends CollectionKey = CollectionKey> {
  body?: string;
  collection: CN;
  data: CollectionEntry<CN>["data"];
  id: string;
}
export interface CollectionPageData {
  baseUrl: string;
  collectionItems: CollectionItem[];
  collectionKey: CollectionKey;
  config: CollectionConfig;
  containerId: string;
  currentPage: number;
  getItemCardProps: (item: CollectionItem) => Promise<{ actionLabel: string; data: CardData }>;
  initialPageSize: number;
  nextUrl?: string;
  prevUrl?: string;
  totalItems: number;
  totalPages: number;
}

export type Company = CollectionEntry<"companies">["data"];

export type Nullable<T> = null | T | undefined;

export interface PaginationLinksOptions {
  baseUrl: string;
  currentPage: number;
  currentUrl: URL;
  customGetPageUrl?: (page: number) => string;
  nextUrl?: string;
  paginationType: PaginationType;
  prevUrl?: string;
  totalPages: number;
}

export type PaginationType = "path" | "query";
export interface PostLink {
  href: string;
  label: string;
}

export type ResponsiveValue<T> = T | { base: T; lg?: T; md?: T; sm?: T; xl?: T };

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

export interface ViewPagePropsTags {
  items: Tag[];
  title: string | undefined;
}
