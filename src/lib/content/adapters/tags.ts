import { getEntry } from "astro:content";

import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";

export class TagsAdapter extends ContentAdapter<"tags"> {
  async getCardData(item: CollectionItem<"tags">): Promise<CardResult> {
    const category = item.data.category ? await getEntry(item.data.category) : undefined;

    return {
      actionLabel: "View Tag",
      data: {
        description: item.data.description,
        image: category?.data.icon,
        subtitle: category?.data.label,
        title: item.data.label,
        url: `/tags/view/${item.id}`,
      },
    };
  }

  async getToolbarItems(item: CollectionItem<"tags">): Promise<ToolbarItem[]> {
    const items: ToolbarItem[] = [];

    if (item.data.category) {
      const category = await getEntry(item.data.category);
      if (category) {
        items.push({
          label: "Category",
          type: "category",
          value: category.data.label,
        });
      }
    }

    return items;
  }

  async getViewProps(item: CollectionItem<"tags">): Promise<Partial<ViewPageProps<"tags">>> {
    const category = item.data.category ? await getEntry(item.data.category) : undefined;

    return {
      description: item.data.description,
      image: category?.data.icon,
      subtitle: category?.data.label,
      tags: { items: [], title: "" },
      title: item.data.label,
    };
  }
}
