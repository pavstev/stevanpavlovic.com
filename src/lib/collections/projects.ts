import type { CollectionItem, ToolbarItem, ViewPageProps } from "./types";

import { PROFILE } from "../config";
import { createAuthorItem } from "./toolbar-items";

const getClassificationToolbarItem = (item: CollectionItem<"projects">): ToolbarItem | undefined => {
  if (!item.data.subtitle) return undefined;
  return {
    label: "Classification",
    value: item.data.subtitle,
  };
};

const getStatusToolbarItem = (item: CollectionItem<"projects">): ToolbarItem => ({
  label: "Status",
  value: item.data.meta || "Completed",
});

export const getProjectProps = (item: CollectionItem<"projects">): ViewPageProps => {
  const author = createAuthorItem(PROFILE);
  const toolbarItems: ToolbarItem[] = [author];

  const classification = getClassificationToolbarItem(item);
  if (classification) toolbarItems.push(classification);
  toolbarItems.push(getStatusToolbarItem(item));

  return {
    author,
    backLink: {
      href: "/projects",
      label: "Back to Projects",
    },
    description: item.data.desc,
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
