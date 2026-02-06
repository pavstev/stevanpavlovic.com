import dayjs from "dayjs";

import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";
import { resolveCompany, resolveTags } from "../helpers";

export class ExperienceAdapter extends ContentAdapter<"experience"> {
  async getCardData(item: CollectionItem<"experience">): Promise<CardResult> {
    const company = await resolveCompany(item.data.company);

    return {
      actionLabel: "View Details",
      data: {
        description: item.data.description,
        footerMeta: `${dayjs(item.data.startDate).format("YYYY")} — ${item.data.endDate ? dayjs(item.data.endDate).format("YYYY") : "Now"}`,
        logo: company?.logo,
        subtitle: company?.name,
        tags: await resolveTags(item.data.tags),
        title: item.data.role,
        url: `/experience/view/${item.id}`,
      },
    };
  }

  getSortDate(item: CollectionItem<"experience">): number {
    return item.data.startDate.valueOf();
  }

  async getToolbarItems(item: CollectionItem<"experience">): Promise<ToolbarItem[]> {
    const company = await resolveCompany(item.data.company);
    const start = dayjs(item.data.startDate);
    const end = item.data.endDate ? dayjs(item.data.endDate) : dayjs();

    const diffMonths = end.diff(start, "month") + 1;
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    const durationStr = [years > 0 ? `${years}y` : "", months > 0 ? `${months}m` : ""].filter(Boolean).join(" ");

    const items: ToolbarItem[] = [];

    if (company) {
      items.push({
        href: company.socialLinks?.find((l) => l.type === "Website")?.handle,
        label: "Company",
        logo: company.logo,
        type: "organization",
        value: company.name,
      });
    }

    items.push({
      label: "Period",
      type: "date",
      value: `${start.format("MMM 'YY")} - ${item.data.endDate ? dayjs(item.data.endDate).format("MMM 'YY") : "Present"}`,
    });

    items.push({
      label: "Tenure",
      type: "time",
      value: durationStr || "< 1m",
    });

    if (item.data.type) {
      items.push({
        label: "Contract",
        type: "text",
        value: item.data.type,
      });
    }

    return items;
  }

  async getViewProps(item: CollectionItem<"experience">): Promise<Partial<ViewPageProps<"experience">>> {
    const company = await resolveCompany(item.data.company);

    return {
      description: item.data.description,
      subtitle: company?.name,
      tags: {
        items: await resolveTags(item.data.tags),
        title: "Technologies Used",
      },
      title: item.data.role,
    };
  }
}
