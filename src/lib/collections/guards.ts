import type { CollectionItem, CollectionKey } from "./types";

export const isBlog = (item: CollectionItem<CollectionKey>): item is CollectionItem<"blog"> =>
  item.collection === "blog";

export const isExperience = (item: CollectionItem<CollectionKey>): item is CollectionItem<"experience"> =>
  item.collection === "experience";

export const isProject = (item: CollectionItem<CollectionKey>): item is CollectionItem<"projects"> =>
  item.collection === "projects";
