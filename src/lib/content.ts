import type { CollectionEntry } from "astro:content";

import { getCollection } from "astro:content";

export const getSortedBlogPosts = async (): Promise<CollectionEntry<"blog">[]> =>
  (await getCollection("blog")).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const formatCompactNumber = (number: number): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    compactDisplay: "short",
    maximumFractionDigits: 1,
    notation: "compact",
  });
  return formatter.format(number);
};
