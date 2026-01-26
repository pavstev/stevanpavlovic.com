import type { CollectionEntry } from "astro:content";

import { getCollection } from "astro:content";

export const getSortedBlogPosts = async (): Promise<
  CollectionEntry<"blog">[]
> =>
  (await getCollection("blog")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
