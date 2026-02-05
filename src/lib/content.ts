import type { CollectionEntry } from "astro:content";

import { getCollection } from "astro:content";

export const getSortedBlogPosts = async (): Promise<
  CollectionEntry<"blog">[]
> =>
  (await getCollection("blog")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

export const formatCompactNumber = (number: number): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    compactDisplay: "short",
    maximumFractionDigits: 1,
    notation: "compact",
  });
  return formatter.format(number);
};

interface Stat {
  format?: "compact" | "plain";
  icon: `mdi:${string}`;
  label: string;
  unit?: string;
  value: number;
}

export const stats: Stat[] = [
  { icon: "mdi:clock-time-eight-outline", label: "Years Exp.", value: 12 },
  { icon: "mdi:server-network", label: "Systems", value: 24 },
  { format: "compact", icon: "mdi:account-group-outline", label: "Users", unit: "+", value: 120000 },
  { icon: "mdi:earth", label: "Countries", value: 15 },
];
