import dayjs from "dayjs";

import type { CollectionItem, ToolbarItem, ViewPageProps } from "./types";

import { PROFILE } from "../../config";
import { createAuthorItem } from "./toolbar-items";

const getPublishedToolbarItem = (item: CollectionItem<"blog">): ToolbarItem => ({
  label: "Published",
  type: "date",
  value: dayjs(item.data.pubDate).format("MMMM YYYY"),
});

const getReadingTimeToolbarItem = (item: CollectionItem<"blog">): ToolbarItem => {
  const wordCount = item.body ? item.body.split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);
  return {
    label: "Read Time",
    type: "text",
    value: `${readingTime} min read`,
  };
};

export const getBlogProps = (item: CollectionItem<"blog">): ViewPageProps => {
  const author = createAuthorItem(PROFILE);

  return {
    backLink: {
      href: "/blog",
      label: "Back to Blog",
    },
    description: item.data.description,
    image: item.data.image,
    subtitle: undefined,
    tags: {
      items: item.data.tags,
      title: "Tags",
    },
    title: item.data.title,
    toolbarItems: [author, getPublishedToolbarItem(item), getReadingTimeToolbarItem(item)],
  };
};
