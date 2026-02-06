import type { CollectionItem, ToolbarItem, ViewPageProps } from "./types";

import { PROFILE } from "../../config";
import { createAuthorItem } from "./toolbar-items";

const getClassificationToolbarItem = (item: CollectionItem<"projects">): ToolbarItem | undefined => {
  if (!item.data.subtitle) return undefined;
  return {
    label: "Classification",
    type: "category",
    value: item.data.subtitle,
  };
};

const getStatusToolbarItem = (item: CollectionItem<"projects">): ToolbarItem => ({
  label: "Status",
  type: "status",
  value: item.data.meta || "Completed",
});

const getProjectDateToolbarItem = (_item: CollectionItem<"projects">): ToolbarItem => ({
  label: "Date",
  type: "date",
  value: "2024", // Placeholder as pubDate might be missing or different format
});

export const getProjectProps = (item: CollectionItem<"projects">): ViewPageProps => {
  const author = createAuthorItem(PROFILE);
  const toolbarItems = [
    author,
    getClassificationToolbarItem(item),
    getStatusToolbarItem(item),
    getProjectDateToolbarItem(item),
  ];

  return {
    backLink: {
      href: "/projects",
      label: "Back to Projects",
    },
    description: item.data.description,
    image: item.data.image,
    subtitle: item.data.subtitle,
    tags: {
      items: item.data.tags,
      title: "Technologies",
    },
    title: item.data.title,
    toolbarItems,
  };
};
