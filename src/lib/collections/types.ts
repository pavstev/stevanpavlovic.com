import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

import type { Author, ToolbarItem } from "./toolbar-items";

import { collections as baseCollections } from "../../content.config";

const DISALLOWED_COLLECTIONS = ["recommendations"] as const;

export type CollectionName = Exclude<keyof typeof baseCollections, (typeof DISALLOWED_COLLECTIONS)[number]>;

export const collections: CollectionName[] = Object.keys(baseCollections).filter(
  (c) => !DISALLOWED_COLLECTIONS.includes(c as any),
) as CollectionName[];

export interface CollectionItem<CN extends CollectionName> {
  collection: CN;
  data: CollectionEntry<CN>["data"];
  id: string;
}

export type DisplayMode = "grid" | "list";

export interface HeroImage {
  alt: string;
  height: number;
  src: ImageMetadata | string;
  width: number;
}

export interface PostLink {
  href: string;
  label: string;
}

export interface Tag {
  id: string;
  label: string;
}

export interface ViewPageProps {
  author?: Author;
  back: PostLink;
  description: string | undefined;
  heroImage?: HeroImage;
  subtitle: string | undefined;
  tags: {
    items: Tag[];
    title: string | undefined;
  };
  title: string;
  toolbarItems: ToolbarItem[];
}
