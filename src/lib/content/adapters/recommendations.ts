import { getEntry } from "astro:content";
import dayjs from "dayjs";

import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";

export class RecommendationsAdapter extends ContentAdapter<"recommendations"> {
  async getCardData(item: CollectionItem<"recommendations">): Promise<CardResult> {
    const person = item.data.person ? await getEntry(item.data.person) : undefined;

    return {
      actionLabel: "Read Story",
      data: {
        description: item.data.context,
        image: item.data.avatar,
        meta: item.data.relationship,
        subtitle: item.data.title,
        title: person ? `${person.data.firstName} ${person.data.lastName}` : item.data.name,
        url: `/recommendations/${item.id}`,
      },
    };
  }

  getSortDate(item: CollectionItem<"recommendations">): number {
    return item.data.date ? item.data.date.valueOf() : 0;
  }

  async getToolbarItems(item: CollectionItem<"recommendations">): Promise<ToolbarItem[]> {
    const p = item.data.person ? await getEntry(item.data.person) : undefined;
    const items: ToolbarItem[] = [];

    if (item.data.relationship) {
      items.push({ label: "Relation", type: "text", value: item.data.relationship });
    }

    if (item.data.date) {
      items.push({ label: "Received", type: "date", value: dayjs(item.data.date).format("MMM YYYY") });
    }

    if (p) {
      items.push({
        avatar: p.data.avatar,
        label: "Author",
        type: "person",
        value: `${p.data.firstName} ${p.data.lastName}`,
      });
    }

    return items;
  }

  async getViewProps(item: CollectionItem<"recommendations">): Promise<Partial<ViewPageProps<"recommendations">>> {
    const person = item.data.person ? await getEntry(item.data.person) : undefined;

    return {
      description: item.data.context,
      subtitle: item.data.title,
      tags: { items: [], title: "" },
      title: person ? `${person.data.firstName} ${person.data.lastName}` : item.data.name,
    };
  }
}
