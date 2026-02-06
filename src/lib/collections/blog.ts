import dayjs from "dayjs";
import { PROFILE } from "../config";
import { createAuthorItem } from "./toolbar-items";
import type { CollectionItem, ViewPageProps, ToolbarItem } from "./types";

export const getPublishedToolbarItem = (item: CollectionItem<"blog">): ToolbarItem => ({
  label: "Published",
  value: dayjs(item.data.pubDate).format("MMMM YYYY"),
});

export const getBlogProps = (item: CollectionItem<"blog">): ViewPageProps => {
  const author = createAuthorItem(PROFILE);

  return {
    author,
    backLink: {
      href: "/blog",
      label: "Back to Blog",
    },
    description: item.data.description,
    image: item.data.heroImage
      ? {
          alt: item.data.title,
          height: 450,
          src: item.data.heroImage,
          width: 800,
        }
      : undefined,
    subtitle: undefined,
    tags: {
      items: item.data.tags || [],
      title: "Tags",
    },
    title: item.data.title,
    toolbarItems: [author, getPublishedToolbarItem(item)],
  };
};
