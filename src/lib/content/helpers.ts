import type { ImageMetadata } from "astro";

import { getEntries, getEntry } from "astro:content";

import type { Author, Company, Tag } from "../types";

export const formatCompactNumber = (number: number): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    compactDisplay: "short",
    maximumFractionDigits: 1,
    notation: "compact",
  });
  return formatter.format(number);
};

export const createAuthorItem = (author: {
  avatar: ImageMetadata;
  name: string;
  role: string;
}): Author => ({
  avatar: author.avatar,
  href: undefined,
  label: "Author",
  logo: author.avatar,
  name: author.name,
  role: author.role,
  type: "person",
  value: author.name,
});

export const resolveTags = async (
  tagsRef?: { collection: "tags"; id: string }[]
): Promise<Tag[]> => {
  if (!tagsRef || tagsRef.length === 0) return [];
  const resolved = await getEntries(tagsRef);
  return resolved.filter((r) => !!r).map((r) => r.data);
};

export const resolveCompany = async (
  companyRef?: string | { collection: "companies"; id: string }
): Promise<Company | undefined> => {
  if (!companyRef) return undefined;
  if (typeof companyRef === "string") {
    const entry = await getEntry("companies", companyRef);
    return entry?.data;
  }
  const entry = await getEntry(companyRef);
  return entry?.data;
};

export const setupDescriptionToggles = (): void => {
  const descriptions = document.querySelectorAll("details.group\\/description");

  for (const details of descriptions) {
    const text = details.querySelector(".description-text") as HTMLElement;
    const toggleWrapper = details.querySelector(".toggle-buttons") as HTMLElement;

    if (!text || !toggleWrapper) continue;

    const isCurrentlyOpen = (details as HTMLDetailsElement).open;
    if (isCurrentlyOpen) {
      (details as HTMLDetailsElement).open = false;
    }

    const isTruncated = text.scrollHeight > text.offsetHeight;

    if (!isTruncated) {
      toggleWrapper.classList.add("hidden");
      toggleWrapper.classList.remove("flex");
      (details.querySelector("summary") as HTMLElement).style.cursor = "default";
      if (isCurrentlyOpen) {
        (details as HTMLDetailsElement).open = true;
      }
      continue;
    }

    toggleWrapper.classList.remove("hidden");
    toggleWrapper.classList.add("flex");

    if (isCurrentlyOpen) {
      (details as HTMLDetailsElement).open = true;
    }
  }
};
