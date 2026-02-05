import type { CollectionEntry } from "astro:content";

interface PaginationProps {
  currentPage: number;
  nextUrl: null | string;
  prevUrl: null | string;
  totalPages: number;
}

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

export const filterPosts = <T extends Post>(posts: T[], filterParam: null | string): T[] => {
  if (!filterParam) {
    return posts;
  }
  if (filterParam === "all") {
    return posts;
  }

  const term = filterParam.toLowerCase();
  return posts.filter(post =>
    (post.data.tags || []).some(tag => tag.toLowerCase() === term));
};

export const getPagination = <T>(
  items: T[],
  pageParam: null | string,
  itemsPerPage = 9,
  baseUrl: string,
  params: URLSearchParams,
): PaginationProps & { paginatedItems: T[] } => {
  const currentPage = parseInt(pageParam || "1");
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const getPageUrl = (page: number): string => {
    const p = new URLSearchParams(params);
    if (page > 1) {
      p.set("page", page.toString());
    }

    if (page <= 1) {
      p.delete("page");
    }

    const qs = p.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  return {
    currentPage,
    nextUrl: currentPage < totalPages ? getPageUrl(currentPage + 1) : null,
    paginatedItems,
    prevUrl: currentPage > 1 ? getPageUrl(currentPage - 1) : null,
    totalPages,
  };
};
