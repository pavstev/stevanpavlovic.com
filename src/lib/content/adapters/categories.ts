import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";

export class CategoriesAdapter extends ContentAdapter<"categories"> {
  getCardData(item: CollectionItem<"categories">): CardResult {
    return {
      actionLabel: "View Category",
      data: {
        description: item.data.description,
        image: item.data.icon,
        subtitle: item.data.label,
        title: item.data.label,
        url: `/categories/${item.id}`,
      },
    };
  }

  getToolbarItems(item: CollectionItem<"categories">): ToolbarItem[] {
    const items: ToolbarItem[] = [];

    if (item.data.color) {
      items.push({ label: "Color", type: "text", value: item.data.color });
    }

    return items;
  }

  getViewProps(item: CollectionItem<"categories">): Partial<ViewPageProps<"categories">> {
    return {
      description: item.data.description,
      image: item.data.icon,
      subtitle: item.data.label,
      tags: { items: [], title: "" },
      title: item.data.label,
    };
  }
}
