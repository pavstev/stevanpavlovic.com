import dayjs from "dayjs";
import { PROFILE } from "../config";
import { createAuthorItem } from "./toolbar-items";
import type { CollectionItem, ViewPageProps, ToolbarItem } from "./types";

export const getPublishedToolbarItem = (item: CollectionItem<"blog">): ToolbarItem => ({
  label: "Published",
  value: dayjs(item.data.pubDate).format("MMMM YYYY"),
});

export const getBlogProps = (item: CollectionItem<"blog">): ViewPageProps => {
  const date = dayjs(item.data.pubDate).format("MMMM YYYY");
  const author = createAuthorItem(PROFILE);

  return {
    author,
    back: {
      href: "/blog",
      label: "Back to Blog",
    },
    description: item.data.description,
    heroImage: item.data.heroImage
      ? {
          alt: item.data.title,
          height: 450,
          src: item.data.heroImage,
          width: 800,
        }
      : undefined,
    subtitle: undefined,
    tags: {
      items: (item.data.tags || []).map((tag) => ({ id: tag, label: tag })),
      title: "Tags",
    },
    title: item.data.title,
    toolbarItems: [author, getPublishedToolbarItem(item)],
  };
};
