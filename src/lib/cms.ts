import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"blog">;

export const sortPosts = <T extends Post>(posts: T[], sortParam = "newest"): T[] => {
  const sorted = [...posts];

  switch (sortParam) {
  case "a-z":
    return sorted.sort((a, b) => a.data.title.localeCompare(b.data.title));
  case "oldest":
    return sorted.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
  case "z-a":
    return sorted.sort((a, b) => b.data.title.localeCompare(a.data.title));
  case "newest":
  default:
    return sorted.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  }
};
