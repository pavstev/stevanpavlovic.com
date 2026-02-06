import type { CollectionKey } from "astro:content";

import type { Nullable } from "./types";

import { NAV_ITEMS, type NavItem, PROFILE, SITE_DESCRIPTION, SITE_TITLE } from "../../config";

export const getCollectionConfig = (
  collection: CollectionKey,
): {
  description: string;
  headerDescription: string;
  headerIcon: string;
  headerTitle: string;
  tagTitle: string;
  title: string;
} => {
  const navItem = NAV_ITEMS[collection as keyof typeof NAV_ITEMS] as Nullable<NavItem>;
  if (!navItem) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  return {
    description: collection === "blog" ? SITE_DESCRIPTION : `${PROFILE.name} - ${navItem.label}`,
    headerDescription: navItem.description,
    headerIcon: navItem.icon,
    headerTitle: navItem.label,
    tagTitle: navItem.tagTitle,
    title: collection === "blog" ? `Blog | ${SITE_TITLE}` : `${navItem.label} | ${PROFILE.name}`,
  };
};
