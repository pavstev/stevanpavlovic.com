import type { ImageMetadata } from "astro";
import type { CollectionEntry, CollectionKey } from "astro:content";

export type ResponsiveValue<T> = T | { base: T; lg?: T; md?: T; sm?: T; xl?: T };

export type { CollectionEntry, CollectionKey };

export interface CardResult {
  actionLabel?: string;
  data: any; // Using any for CardData to avoid circular dependency with Astro component
}

export interface CollectionPageData {
  baseUrl: string;
  collectionItems: any[]; // Decoupled from specific getPageItems return type
  collectionKey: CollectionKey;
  config: any;
  containerId: string;
  currentPage: number;
  display: DisplayMode;
  displayUrls: ViewUrls;
  getItemCardProps: (item: any) => any;
  initialPageSize: number;
  nextUrl?: string;
  prevUrl?: string;
  totalItems: number;
  totalPages: number;
}
// --- Display & Pagination ---
export type DisplayMode = "grid" | "list";

// --- Resume ---
export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Experience {
  company: string;
  description: string;
  endDate?: string;
  period?: string;
  role: string;
  startDate: string;
}

export interface PagefindInstance {
  options: (options: { showImages: boolean }) => void;
  preload: (term: string) => Promise<void>;
  search: (query: string) => Promise<{
    results: PagefindResult[];
  }>;
}

// --- Search ---
export interface PagefindResult {
  data: () => Promise<{
    content: string;
    excerpt: string;
    meta: {
      category?: string;
      image?: string;
      title: string;
    };
    url: string;
  }>;
  id: string;
}

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

export interface Profile {
  avatar?: ImageMetadata;
  email: string;
  location: string;
  name: string;
  phone?: string;
  role: string;
  summary: string;
  website?: string;
}

export interface QuickAction {
  category: "Action" | "Navigation";
  href?: string;
  icon: string;
  id: string;
  label: string;
  onSelect?: () => void;
}

export interface ResumeData {
  education: Education[];
  experience: Experience[];
  profile: Profile;
  skills: string[];
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

export interface ViewPagePropsTags {
  items: Tag[];
  title: string | undefined;
}

export type ViewUrls = {
  [k in DisplayMode]: string;
};

// --- Content / Collection ---
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
