// Shared collection page logic
import { type CollectionEntry, getCollection } from "astro:content";

import type { CardData } from "./card-helpers";

import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { NAV_ITEMS, PROFILE } from "./config";

export type CollectionName = "blog" | "experience" | "projects";
export type ViewMode = "grid" | "list";

interface CollectionItem<CN extends CollectionName> {
  collection: CN;
  data: CollectionEntry<CN>["data"];
  id: string;
}

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
  list: currentPage === 1 ? `/${collection}` : `/${collection}/list/${currentPage.toString()}`,
});

const itemIsBlog = (item: CollectionItem<CollectionName>): item is CollectionItem<"blog"> => item.collection === "blog";
const itemIsExperience = (item: CollectionItem<CollectionName>): item is CollectionItem<"experience"> => item.collection === "experience";
const itemIsProject = (item: CollectionItem<CollectionName>): item is CollectionItem<"projects"> => item.collection === "projects";

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

export const getItemCardProps = <CN extends CollectionName>(_collection: CN, item: CollectionItem<CN>): {
  actionLabel?: string;
  data: CardData;
} => {
  if (itemIsBlog(item)) {
    // Blog items are CollectionEntry<"blog">
    const blogItem = item as CollectionItem<"blog">;
    return {
      actionLabel: "Read Post",
      data: {
        date: blogItem.data.pubDate,
        description: blogItem.data.description,
        image: blogItem.data.heroImage,
        // eslint-disable-next-line
        subtitle: "subtitle" in blogItem.data ? (blogItem.data as any).subtitle as string : undefined,
        // eslint-disable-next-line
        tags: "tags" in blogItem.data ? (blogItem.data as any).tags as string[] : undefined,
        title: blogItem.data.title,
        url: `/blog/view/${blogItem.id}`,
      },
    };
  }
  if (itemIsProject(item)) {
    const projectItem = item as CollectionItem<"projects">;
    return {
      actionLabel: "View Project",

      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
      data: {
        description: projectItem.data.desc,
        image: "heroImage" in projectItem.data ? (projectItem.data as any).heroImage : ("image" in projectItem.data ? (projectItem.data as any).image : undefined),
        meta: (projectItem.data as any).pubDate ? new Date((projectItem.data as any).pubDate).getFullYear().toString() : "",
        subtitle: projectItem.data.subtitle,
        tags: projectItem.data.tags,
        title: projectItem.data.title,
        url: `/projects/view/${projectItem.id}`,
      },
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
    };
  }
  if (itemIsExperience(item)) {
    const expItem = item as CollectionItem<"experience">;
    return {
      actionLabel: "View Role",
      data: {
        description: expItem.data.description,
        footerMeta: `${new Date(expItem.data.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} — ${expItem.data.endDate ? new Date(expItem.data.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present"}`,
        subtitle: expItem.data.company,
        tags: expItem.data.skills,
        title: expItem.data.role,
        url: `/experience/view/${expItem.id}`,
      },
    };
  }
  return { actionLabel: undefined, data: {} as CardData };
};

export const getPageItems = <CN extends CollectionName>(sortedItems: CollectionItem<CN>[], pageNum: number): CollectionItem<CN>[] => {
  const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return sortedItems.slice(startIndex, endIndex);
};
