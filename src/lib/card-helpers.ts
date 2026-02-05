import type { CollectionEntry } from "astro:content";

import { cva } from "class-variance-authority";

export const cardVariants = cva(
  "group/card relative flex w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 text-left backdrop-blur-md transition-all duration-300 sm:p-6",
  {
    defaultVariants: {
      interactive: false,
      variant: "default",
    },
    variants: {
      interactive: {
        false: "",
        true: "cursor-pointer hover:-translate-y-1 hover:border-primary/20 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
      },
      variant: {
        default: "",
        ghost: "border-transparent bg-transparent shadow-none",
        glass: "glass text-foreground",
        outline: "border border-border bg-transparent",
      },
    },
  },
);

type CardPost = CollectionEntry<"blog"> | CollectionEntry<"projects">;

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
      ? `/blog/view/${post.id}/`
      : `/projects/view/${post.id}/`;

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
