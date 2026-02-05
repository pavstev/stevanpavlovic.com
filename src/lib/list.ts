import type { DropdownOption } from "../components/atoms/dropdown.astro";

export interface FilterConfig {
  id: string;
  label: string;
  options: DropdownOption[];
  selectedValue?: string;
  selectedValues?: string[];
}

export type PaginationType = "path" | "query";

export type ViewMode = "grid" | "list";

export interface ViewUrls {
  grid: string;
  list: string;
}

export const VIEW_MODES: { icon: string; label: string; mode: ViewMode }[] = [
  { icon: "mdi:format-list-bulleted", label: "List", mode: "list" },
  { icon: "mdi:view-column", label: "Grid", mode: "grid" },
];

export const ITEMS_PER_PAGE_OPTIONS = [
  { label: "6", value: "6" },
  { label: "9", value: "9" },
  { label: "12", value: "12" },
  { label: "24", value: "24" },
];

/**
 * Helper to build a URL by merging a base path with current query params and overrides.
 */
export const buildListUrl = (
  currentUrl: URL,
  paginationType: PaginationType,
  path: string,
  paramsToSet: Record<string, number | string | undefined> = {},
): string => {
  const url = new URL(path, currentUrl.origin);
  const currentParams = currentUrl.searchParams;

  // 1. Preserve existing params
  for (const [key, value] of currentParams.entries()) {
    // In query mode, we preserve 'page' unless it's explicitly being set
    if (paginationType === "path" && key === "page") {
      continue;
    }
    url.searchParams.set(key, value);
  }

  // 2. Apply new overrides
  for (const [key, value] of Object.entries(paramsToSet)) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (value === undefined || value === null) {
      url.searchParams.delete(key);
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return url.pathname + url.search;
};

interface PaginationLinksOptions {
  baseUrl: string;
  currentPage: number;
  currentUrl: URL;
  customGetPageUrl?: (page: number) => string;
  nextUrl?: string;
  paginationType: PaginationType;
  prevUrl?: string;
  totalPages: number;
}

export const getPaginationLinks = ({
  baseUrl,
  currentPage,
  currentUrl,
  customGetPageUrl,
  nextUrl,
  paginationType,
  prevUrl,
  totalPages,
}: PaginationLinksOptions): {
  nextLink: string | undefined;
  prevLink: string | undefined;
} => {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  const getPageUrl = (p: number): string => {
    if (customGetPageUrl) {
      return customGetPageUrl(p);
    }

    if (paginationType === "query") {
      return buildListUrl(currentUrl, paginationType, cleanBaseUrl, {
        page: p,
      });
    }

    return p === 1 ? cleanBaseUrl : `${cleanBaseUrl}/${p.toString()}`;
  };

  const resolveLink = (p: number): string => {
    const base = getPageUrl(p);
    if (base.includes("?")) {
      return base;
    }
    return buildListUrl(currentUrl, paginationType, base);
  };

  const nextLink = nextUrl
    ? buildListUrl(currentUrl, paginationType, nextUrl)
    : currentPage < totalPages
      ? resolveLink(currentPage + 1)
      : undefined;

  const prevLink = prevUrl
    ? buildListUrl(currentUrl, paginationType, prevUrl)
    : currentPage > 1
      ? resolveLink(currentPage - 1)
      : undefined;

  return { nextLink, prevLink };
};
