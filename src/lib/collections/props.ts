import dayjs from "dayjs";

import type { CardData } from "../../components/organisms/card.astro";
import { getBlogProps } from "./blog";
import { getExperienceProps } from "./experience";
import { isBlog, isExperience, isProject } from "./guards";
import { getProjectProps } from "./projects";
import type { CollectionItem, CollectionName, ViewPageProps } from "./types";

export const getViewPageProps = (item: CollectionItem<CollectionName>): ViewPageProps => {
  if (isBlog(item)) return getBlogProps(item);
  if (isExperience(item)) return getExperienceProps(item);
  if (isProject(item)) return getProjectProps(item);

  return {
    backLink: { href: "/", label: "Back" },
    description: "",
    subtitle: "",
    tags: { items: [], title: "Tags" },
    title: "",
    toolbarItems: [],
  };
};

export const getItemCardProps = (
  item: CollectionItem<CollectionName>,
): {
  actionLabel: string;
  data: CardData;
} => {
  if (isBlog(item)) {
    const { data } = item;
    return {
      actionLabel: "Read Post",
      data: {
        date: data.pubDate,
        description: data.description,
        image: data.heroImage,
        tags: data.tags?.map((tag) => tag.label),
        title: data.title,
        url: `/blog/view/${item.id}`,
      },
    };
  }
  if (isExperience(item)) {
    const { data } = item;
    return {
      actionLabel: "View Role",
      data: {
        description: data.description,
        footerMeta: `${dayjs(data.startDate).format("MMM YYYY")} — ${data.endDate ? dayjs(data.endDate).format("MMM YYYY") : "Present"}`,
        logo: typeof data.company !== "string" ? data.company.logo : undefined,
        subtitle: typeof data.company === "string" ? data.company : data.company.name,
        tags: data.skills?.map((skill) => skill.label),
        title: data.role,
        url: `/experience/view/${item.id}`,
      },
    };
  }
  if (isProject(item)) {
    const { data } = item;
    return {
      actionLabel: "View Project",
      data: {
        description: data.desc,
        image: data.image,
        meta: data.meta,
        subtitle: data.subtitle,
        tags: data.tags?.map((tag) => tag.label),
        title: data.title,
        url: `/projects/view/${item.id}`,
      },
    };
  }
  return { actionLabel: "View", data: {} };
};
