import dayjs from "dayjs";

import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";

export class CompaniesAdapter extends ContentAdapter<"companies"> {
  getCardData(item: CollectionItem<"companies">): CardResult {
    return {
      actionLabel: "View Entity",
      data: {
        description: item.data.description,
        image: item.data.logo,
        logo: item.data.logo,
        meta: item.data.size,
        subtitle: item.data.industry,
        title: item.data.name,
        url: `/companies/${item.id}`,
      },
    };
  }

  getSortDate(item: CollectionItem<"companies">): number {
    return item.data.founded ? item.data.founded.valueOf() : 0;
  }

  getToolbarItems(item: CollectionItem<"companies">): ToolbarItem[] {
    const items: ToolbarItem[] = [];

    if (item.data.industry) {
      items.push({ label: "Industry", type: "industry", value: item.data.industry });
    }

    if (item.data.size) {
      items.push({ label: "Size", type: "text", value: item.data.size });
    }

    if (item.data.type) {
      items.push({ label: "Type", type: "text", value: item.data.type });
    }

    if (item.data.founded) {
      const years = dayjs().diff(dayjs(item.data.founded), "year");
      items.push({
        label: "Est.",
        type: "date",
        value: `${dayjs(item.data.founded).format("YYYY")} (${years}y ago)`,
      });
    }

    return items;
  }

  getViewProps(item: CollectionItem<"companies">): Partial<ViewPageProps<"companies">> {
    return {
      description: item.data.description,
      image: item.data.logo,
      subtitle: item.data.industry,
      title: item.data.name,
    };
  }
}
