import type { ImageMetadata } from "astro";
import type { CollectionEntry, CollectionKey, CollectionKey as collectionMap } from "astro:content";

export interface Author extends ToolbarItem {
  avatar: ImageMetadata;
  name: string;
  role: string;
  type: "person";
}

export abstract class ContentAdapter<CN extends collectionMap> {
  abstract getCardData(item: CollectionItem<CN>): Promise<CardResult>;
  abstract getSortDate(item: CollectionItem<CN>): number;
  abstract getToolbarItems(item: CollectionItem<CN>): Promise<ToolbarItem[]> | ToolbarItem[];
  abstract getViewProps(
    item: CollectionItem<CN>
  ): Partial<ViewPageProps<CN>> | Promise<Partial<ViewPageProps<CN>>>;
}

export type { CollectionEntry, collectionMap as CollectionKey };

const collectionMap = {
  blog: true,
  companies: true,
  experience: true,
  locations: false,
  people: false,
  projects: true,
  recommendations: false,
  tags: true,
} as const satisfies {
  [Key in CollectionKey]: boolean;
};

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

export interface CollectionItem<CN extends collectionMap = collectionMap> {
  body?: string;
  collection: CN;
  data: CollectionEntry<CN>["data"];
  id: string;
}

export interface CollectionPageData {
  baseUrl: string;
  collectionItems: CollectionItem[];
  collectionKey: collectionMap;
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

export type ViewableCollection = {
  [K in CollectionKey]: (typeof collectionMap)[K] extends true ? K : never;
}[CollectionKey];

export interface ViewPageProps<_CN extends collectionMap = collectionMap> {
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
