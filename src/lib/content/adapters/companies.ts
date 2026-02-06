import { getEntry } from "astro:content";
import dayjs from "dayjs";

import type { CollectionItem, Tag, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";

export class CompaniesAdapter extends ContentAdapter<"companies"> {
  async getCardData(item: CollectionItem<"companies">): Promise<CardResult> {
    const tags = await this.getTags(item.data.technologies?.slice(0, 3));
    return {
      actionLabel: "View Entity",
      data: {
        description: item.data.description,
        image: item.data.logo,
        logo: item.data.logo,
        meta: item.data.size,
        subtitle: item.data.industry,
        tags,
        title: item.data.name,
        url: `/companies/view/${item.id}`,
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

  async getViewProps(item: CollectionItem<"companies">): Promise<Partial<ViewPageProps<"companies">>> {
    const tags = await this.getTags(item.data.technologies);
    return {
      description: item.data.description,
      image: item.data.logo,
      subtitle: item.data.industry,
      tags: {
        items: tags,
        title: "Tech Stack",
      },
      title: item.data.name,
    };
  }

  private async getTags(ids: string[] | undefined): Promise<Tag[]> {
    if (!ids) return [];
    const tags = await Promise.all(ids.map(async (id) => getEntry("tags", id)));
    return tags.filter((t) => t !== undefined).map((t) => t.data);
  }
}
