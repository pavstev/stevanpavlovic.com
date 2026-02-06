import type { ImageMetadata } from "astro";

export interface Author extends ToolbarItem {
  avatar: ImageMetadata;
  name: string;
  role: string;
}

export interface ToolbarItem {
  href?: string;
  label: string;
  logo?: ImageMetadata;
  value: string;
}

export const createAuthorItem = (author: { avatar: ImageMetadata; name: string; role: string }): Author => ({
  avatar: author.avatar,
  href: undefined,
  label: "Author",
  logo: author.avatar,
  name: author.name,
  role: author.role,
  value: author.name,
});
