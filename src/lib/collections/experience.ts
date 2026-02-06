import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { PROFILE } from "../config";
import { createAuthorItem } from "./toolbar-items";
import type { CollectionItem, ToolbarItem, ViewPageProps } from "./types";

dayjs.extend(duration);

export const getOrganizationToolbarItem = (item: CollectionItem<"experience">): ToolbarItem | undefined => {
  if (!item.data.company) return undefined;

  return typeof item.data.company !== "string"
    ? {
        href: item.data.company.website,
        label: "Organization",
        logo: item.data.company.logo,
        value: item.data.company.name,
      }
    : {
        label: "Organization",
        value: item.data.company,
      };
};

export const getTimelineToolbarItem = (item: CollectionItem<"experience">): ToolbarItem => {
  const start = dayjs(item.data.startDate);
  const end = item.data.endDate ? dayjs(item.data.endDate) : dayjs();
  const dateRange = `${start.format("MMM YYYY")} — ${item.data.endDate ? dayjs(item.data.endDate).format("MMM YYYY") : "Present"}`;

  const diffMonths = end.diff(start, "month") + 1;
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  const durationStr = [years > 0 ? `${years}y` : "", months > 0 ? `${months}m` : ""].filter(Boolean).join(" ");

  return {
    label: "Timeline",
    value: `${dateRange} (${durationStr})`,
  };
};

export const getExperienceProps = (item: CollectionItem<"experience">): ViewPageProps => {
  const author = createAuthorItem(PROFILE);
  const toolbarItems: ToolbarItem[] = [author];

  const orgItem = getOrganizationToolbarItem(item);
  if (orgItem) toolbarItems.push(orgItem);
  toolbarItems.push(getTimelineToolbarItem(item));

  return {
    author,
    back: {
      href: "/experience",
      label: "Back to Experience",
    },
    description: item.data.description,
    heroImage: undefined,
    subtitle: typeof item.data.company === "string" ? item.data.company : item.data.company.name,
    tags: {
      items: (item.data.skills || []).map((skill) => ({ id: skill, label: skill })),
      title: "Skills",
    },
    title: item.data.role,
    toolbarItems,
  };
};
