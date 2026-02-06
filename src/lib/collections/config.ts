import type { CollectionName } from "./types";

import { SITE_DESCRIPTION, SITE_TITLE } from "../../consts";
import { NAV_ITEMS, type NavItem, PROFILE } from "../config";

export const getCollectionConfig = (
  collection: CollectionName,
): {
  description: string;
  headerDescription: string;
  headerIcon: string;
  headerTitle: string;
  tagTitle: string;
  title: string;
} => {
  const navItem = NAV_ITEMS[collection] as NavItem | undefined;
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
