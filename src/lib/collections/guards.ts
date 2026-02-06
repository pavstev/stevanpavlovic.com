import type { CollectionItem, CollectionName } from "./types";

export const isBlog = (item: CollectionItem<CollectionName>): item is CollectionItem<"blog"> =>
  item.collection === "blog";

export const isExperience = (item: CollectionItem<CollectionName>): item is CollectionItem<"experience"> =>
  item.collection === "experience";

export const isProject = (item: CollectionItem<CollectionName>): item is CollectionItem<"projects"> =>
  item.collection === "projects";
