// Shared collection page logic
import { type CollectionEntry, getCollection } from "astro:content";

import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { NAV_ITEMS, PROFILE } from "./config";

export interface CollectionItem<CN extends CollectionName> {
  collection: CN;
  data: CollectionEntry<CN>["data"];
  id: string;
}
export type CollectionName = "blog" | "experience" | "projects";

export interface CollectionPageProps<CN extends CollectionName> {
  collection: CN;
  currentPage: number;
  items: CollectionItem<CN>[];
  totalItems: number;
  totalPages: number;
  view: ViewMode;
}

export type ViewMode = "grid" | "list";

export const ITEMS_PER_PAGE = 10;

export const buildPaginationUrls = (
  collection: CollectionName,
  view: ViewMode,
  currentPage: number,
  totalPages: number,
): {
  nextUrl: string | undefined;
  prevUrl: string | undefined;
} => {
  const prevUrl = currentPage > 1
    ? (currentPage === 2
      ? `/${collection}/${view}`
      : `/${collection}/${view}/${(currentPage - 1).toString()}`)
    : undefined;

  const nextUrl = currentPage < totalPages
    ? `/${collection}/${view}/${(currentPage + 1).toString()}`
    : undefined;

  return { nextUrl, prevUrl };
};

export const buildViewUrls = (collection: CollectionName, currentPage: number): {
  grid: string;
  list: string;
} => ({
  grid: currentPage === 1 ? `/${collection}/grid` : `/${collection}/grid/${currentPage.toString()}`,
  list: currentPage === 1 ? `/${collection}/list` : `/${collection}/list/${currentPage.toString()}`,
});

const itemIsBlog = (item: CollectionItem<CollectionName>): item is CollectionItem<"blog"> => item.collection === "blog";
const itemIsExperience = (item: CollectionItem<CollectionName>): item is CollectionItem<"experience"> => item.collection === "experience";

export const getCollectionConfig = (collection: CollectionName): {
  description: string;
headerDescription: string;
headerIcon: string;
headerTitle: string;
title: string;
} => {
  const navItem = NAV_ITEMS[collection];

  if (!(navItem as unknown)) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  const title = collection === "blog"
    ? `Blog | ${SITE_TITLE}`
    : `${navItem.label} | ${PROFILE.name}`;

  const description = collection === "blog"
    ? SITE_DESCRIPTION
    : `${PROFILE.name} - ${navItem.label}`;

  return {
    description,
    headerDescription: navItem.description,
    headerIcon: navItem.icon,
    headerTitle: navItem.label,
    title,
  };
};

const getItemDate = <CN extends CollectionName>(item: CollectionItem<CN>): number => {
  if (itemIsBlog(item)) {
    return new Date(item.data.pubDate).getTime();
  }

  if (itemIsExperience(item)) {
    return new Date(item.data.startDate).getTime();
  }

  return 0;
};

export const getCollectionData = async <CN extends CollectionName>(collection: CN): Promise<CollectionItem<CN>[]> => {
  const allItems = await getCollection(collection);

  const sortedItems = allItems.sort((a, b) => getItemDate(b) - getItemDate(a));

  return sortedItems as CollectionItem<CN>[];
};

export const getItemCardProps = <CN extends CollectionName>(collection: CN, item: CollectionItem<CN>) => {
  if (collection === "blog") {
    return { post: item, variant: "content" };
  }
  if (collection === "projects") {
    return {
      portfolioItem: {
        desc: item.data.description,
        href: `/projects/view/${item.id}`,
        id: item.id,
        meta: item.data.pubDate ? new Date(item.data.pubDate).getFullYear().toString() : "",
        subtitle: item.data.subtitle,
        tags: item.data.tags,
        title: item.data.title,
      },
      variant: "portfolio",
    };
  }
  if (collection === "experience") {
    return {
      portfolioItem: {
        company: item.data.company,
        desc: item.data.description,
        endDate: item.data.endDate,
        href: `/experience/view/${item.id}`,
        id: item.id,
        location: item.data.location,
        logo: item.data.logo,
        meta: `${new Date(item.data.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} — ${item.data.endDate ? new Date(item.data.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present"}`,
        role: item.data.role,
        startDate: item.data.startDate,
        subtitle: item.data.company,
        tags: item.data.skills,
        title: item.data.role,
      },
      variant: "portfolio",
    };
  }
  return {};
};

export const getPageItems = <CN extends CollectionName>(sortedItems: CollectionItem<CN>[], pageNum: number): CollectionItem<CN>[] => {
  const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return sortedItems.slice(startIndex, endIndex);
};
