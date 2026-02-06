import type { ImageMetadata } from "astro";

export interface Author extends ToolbarItem {
  avatar: ImageMetadata;
  name: string;
  role: string;
  type: "person";
}

export interface ToolbarItem {
  href?: string;
  label: string;
  logo?: ImageMetadata;
  type: ToolbarItemType;
  value: string;
}

export type ToolbarItemType = "category" | "date" | "link" | "organization" | "person" | "status" | "text";

export const createAuthorItem = (author: { avatar: ImageMetadata; name: string; role: string }): Author => ({
  avatar: author.avatar,
  href: undefined, // Authors might have a profile link later
  label: "Author",
  logo: author.avatar,
  name: author.name,
  role: author.role,
  type: "person",
  value: author.name,
});
