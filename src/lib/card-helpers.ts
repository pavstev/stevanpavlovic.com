import type { CollectionEntry } from "astro:content";

import { cva } from "class-variance-authority";
// Define types explicitly to avoid circular dependency issues if we imported back from card.astro
// But ideally, we move types here entirely.

export const cardVariants = cva(
  "group/card relative flex w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-black/60 p-5 text-left backdrop-blur-2xl transition-all duration-500 ease-out sm:p-6 shadow-2xl",
  {
    defaultVariants: {
      interactive: false,
      style: "default",
    },
    variants: {
      interactive: {
        false: "",
        true: "cursor-pointer hover:-translate-y-1 hover:border-white/20 hover:bg-black/80 hover:shadow-emerald-900/10",
      },
      style: {
        default: "",
        navigation: "!p-4 !sm:p-6 bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/60",
      },
    },
  },
);

type CardPost = CollectionEntry<"blog"> | CollectionEntry<"projects"> | CollectionEntry<"toys">;

export const getCardData = (post: CardPost): {
    description: string;
    heroImage: ImageMetadata | string | undefined;
    postUrl: string;
    pubDate: Date | undefined;
    subtitle: string | undefined;
    title: string;
  } => {
  const collection = post.collection;
  const postUrl
    = collection === "blog"
      ? `/blog/${post.id}/`
      : collection === "toys"
        ? `/playground/${post.id}/`
        : `/projects/${post.id}/`;

  const data = post.data;
  const heroImage
    = "heroImage" in data
      ? data.heroImage
      : "image" in data
        ? data.image
        : undefined;

  const description
    = "description" in data
      ? data.description
      : "desc" in data
        ? data.desc
        : "";

  const pubDate = "pubDate" in data ? data.pubDate : undefined;
  const subtitle = "subtitle" in data ? data.subtitle : undefined;

  return {
    description,
    heroImage,
    postUrl,
    pubDate: pubDate,
    subtitle,
    title: data.title,
  };
};
