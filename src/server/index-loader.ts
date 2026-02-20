import type { BentoItem } from "@components/custom/bento/bento-types.ts";

import { type CollectionEntry, getCollection } from "astro:content";

type ContentType = "blog" | "experience" | "projects";

interface TypedContentItem {
  data: {
    description?: string;
    featured?: boolean;
    icon?: string;
    label?: string;
    pubDate?: Date;
    startDate?: Date;
    tags?: (string | { id: string })[];
    title?: string;
  };
  id: string;
  type: ContentType;
}

const getRelatedItems = (tagId: string, allContent: TypedContentItem[]): TypedContentItem[] => {
  return allContent.filter((item) => {
    const itemTags = item.data.tags;
    if (!itemTags) return false;
    return itemTags.some((t) => (typeof t === "string" ? t === tagId : t.id === tagId));
  });
};

const configureCounter = (item: BentoItem, relatedItems: TypedContentItem[]): void => {
  item.statistic = {
    end: relatedItems.length,
    label: "Related Items",
    start: 0,
    suffix: "+",
    value: relatedItems.length.toString(),
  };
};

const configureIcons = (item: BentoItem, relatedItems: TypedContentItem[]): void => {
  const icons = [
    ...new Set(
      relatedItems
        .map((item) => item.data.icon)
        .filter((icon): icon is string => !!icon)
        .slice(0, 6)
    ),
  ];

  item.featureIcons =
    icons.length >= 3
      ? icons
      : [
          "simple-icons:astro",
          "simple-icons:react",
          "simple-icons:tailwindcss",
          "simple-icons:typescript",
          "simple-icons:nextdotjs",
          "simple-icons:framer",
        ];
};

const configureMetrics = (
  item: BentoItem,
  relatedItems: TypedContentItem[],
  blogCount: number,
  projectCount: number
): void => {
  item.metrics = [
    { color: "emerald", label: "Projects", suffix: "", value: projectCount },
    { color: "blue", label: "Blog", suffix: "", value: blogCount },
    {
      color: "violet",
      label: "Impact",
      suffix: "/10",
      value: Math.min(10, Math.ceil(relatedItems.length / 2) || 1),
    },
  ];
};

const configureSpotlight = (item: BentoItem, relatedItems: TypedContentItem[]): void => {
  const spotlightItems = relatedItems
    .map((item) => item.data.title || item.data.label)
    .filter((title): title is string => !!title)
    .slice(0, 3);

  item.spotlightItems =
    spotlightItems.length > 0
      ? spotlightItems
      : ["Modern Web Architecture", "Scalable Design Systems", "High Performance Apps"];
};

const configureTimeline = (item: BentoItem, relatedItems: TypedContentItem[]): void => {
  const timeline = relatedItems
    .map((item) => {
      const date = item.data.pubDate || item.data.startDate;
      const title = item.data.title || item.data.label;
      return date && title ? { event: title, year: new Date(date).getFullYear().toString() } : null;
    })
    .filter((t): t is { event: string; year: string } => !!t)
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .slice(0, 3);

  item.timeline =
    timeline.length > 0
      ? timeline
      : [
          { event: "Started Journey", year: "2018" },
          { event: "Senior Developer", year: "2021" },
          { event: "Lead Architect", year: "2024" },
        ];
};

const configureTyping = (
  item: BentoItem,
  tag: CollectionEntry<"tags">,
  blogCount: number,
  projectCount: number
): void => {
  item.typingText = `// Exploring ${tag.data.label}\nconst ${tag.id.replace(/-/g, "_")} = {\n  projects: ${projectCount},\n  articles: ${blogCount},\n  status: "active"\n};`;
};

type FeatureConfigurator = (params: {
  blogCount: number;
  item: BentoItem;
  projectCount: number;
  relatedItems: TypedContentItem[];
  tag: CollectionEntry<"tags">;
}) => void;

type FeatureType = NonNullable<BentoItem["feature"]>;

const FEATURE_CONFIGURATORS: Record<FeatureType, FeatureConfigurator> = {
  chart: () => {},
  code: () => {},
  counter: ({ item, relatedItems }) => configureCounter(item, relatedItems),
  custom: () => {},
  icons: ({ item, relatedItems }) => configureIcons(item, relatedItems),
  metrics: ({ blogCount, item, projectCount, relatedItems }) =>
    configureMetrics(item, relatedItems, blogCount, projectCount),
  spotlight: ({ item, relatedItems }) => configureSpotlight(item, relatedItems),
  timeline: ({ item, relatedItems }) => configureTimeline(item, relatedItems),
  typing: ({ blogCount, item, projectCount, tag }) =>
    configureTyping(item, tag, blogCount, projectCount),
};

export const getIndexLoaderData = async (): Promise<BentoItem[]> => {
  const [tags, blogItems, projectItems, experienceItems] = await Promise.all([
    getCollection("tags", ({ data }) => data.featured === true),
    getCollection("blog"),
    getCollection("projects"),
    getCollection("experience"),
  ]);

  const allContent: TypedContentItem[] = [
    ...blogItems.map((item) => ({ ...item, type: "blog" as const })),
    ...projectItems.map((item) => ({ ...item, type: "projects" as const })),
    ...experienceItems.map((item) => ({ ...item, type: "experience" as const })),
  ];

  const features: BentoItem["feature"][] = [
    "icons",
    "metrics",
    "spotlight",
    "counter",
    "timeline",
    "typing",
  ];

  return tags.map((tag, index) => {
    const relatedItems = getRelatedItems(tag.id, allContent);
    const projectCount = relatedItems.filter((i) => i.type === "projects").length;
    const blogCount = relatedItems.filter((i) => i.type === "blog").length;

    const feature = features[index % features.length];
    const item: BentoItem = {
      className: "col-span-1",
      description: tag.data.description || `Explore ${tag.data.label} related content.`,
      feature,
      href: `/tags/${tag.id}`,
      icon: tag.data.icon,
      id: tag.id,
      title: tag.data.label,
    };

    const configurator = FEATURE_CONFIGURATORS[feature as FeatureType];
    if (configurator) {
      configurator({ blogCount, item, projectCount, relatedItems, tag });
    }

    return item;
  });
};