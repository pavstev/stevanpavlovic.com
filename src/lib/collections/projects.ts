import { PROFILE } from "../config";
import { createAuthorItem } from "./toolbar-items";
import type { CollectionItem, ToolbarItem, ViewPageProps } from "./types";

export const getClassificationToolbarItem = (item: CollectionItem<"projects">): ToolbarItem | undefined => {
  if (!item.data.subtitle) return undefined;
  return {
    label: "Classification",
    value: item.data.subtitle,
  };
};

export const getStatusToolbarItem = (item: CollectionItem<"projects">): ToolbarItem => ({
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
    back: {
      href: "/projects",
      label: "Back to Projects",
    },
    description: item.data.desc,
    heroImage: item.data.image
      ? {
          alt: item.data.title,
          height: 450,
          src: item.data.image,
          width: 800,
        }
      : undefined,
    subtitle: item.data.subtitle,
    tags: {
      items: (item.data.tags || []).map((tag) => ({ id: tag, label: tag })),
      title: "Technologies",
    },
    title: item.data.title,
    toolbarItems,
  };
};
