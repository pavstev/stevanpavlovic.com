import { getEntries, getEntry } from "astro:content";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import type { CollectionItem, ToolbarItem as TI, ViewPageProps } from "./types";

import { PROFILE } from "../../config";
import { createAuthorItem } from "./toolbar-items";

dayjs.extend(duration);

const getOrganizationToolbarItem = async (item: CollectionItem<"experience">): Promise<TI | undefined> => {
  if (!item.data.company) {
    return undefined;
  }

  const company = await getEntry("companies", item.data.company);

  if (!company) {
    return undefined;
  }

  return {
    href: item.data.company,
    label: "Organization",
    logo: item.data.company.logo,
    type: "organization",
    value: item.data.company.name,
  };
};

const getDurationToolbarItem = (item: CollectionItem<"experience">): TI => {
  const start = dayjs(item.data.startDate);
  const end = item.data.endDate ? dayjs(item.data.endDate) : dayjs();
  const diffMonths = end.diff(start, "month") + 1;
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  const durationStr = [years > 0 ? `${years} yr` : "", months > 0 ? `${months} mo` : ""].filter(Boolean).join(" ");

  return {
    label: "Duration",
    type: "text",
    value: durationStr || "Less than a month",
  };
};

const getDateRangeToolbarItem = (item: CollectionItem<"experience">): TI => {
  const start = dayjs(item.data.startDate);
  const dateRange = `${start.format("MMM YYYY")} - ${item.data.endDate ? dayjs(item.data.endDate).format("MMM YYYY") : "Present"}`;

  return {
    label: "Date",
    type: "date",
    value: dateRange,
  };
};

export const getExperienceProps = async (item: CollectionItem<"experience">): Promise<ViewPageProps> => {
  const author = createAuthorItem(PROFILE);
  const toolbarItems = [
    author,
    await getOrganizationToolbarItem(item),
    getDateRangeToolbarItem(item),
    getDurationToolbarItem(item),
  ];

  return {
    backLink: {
      href: "/experience",
      label: "Back to Experience",
    },
    description: item.data.description,
    image: undefined,
    subtitle: item.data.company,
    tags: {
      items: await getEntries(item.data.tags ?? []),
      title: "Skills",
    },
    title: item.data.role,
    toolbarItems,
  };
};
