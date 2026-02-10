import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../types";

export class LocationsAdapter extends ContentAdapter<"locations"> {
  getCardData(item: CollectionItem<"locations">): Promise<CardResult> {
    return Promise.resolve({
      actionLabel: "Explore",
      data: {
        description: item.data.description,
        image: item.data.gallery?.[0],
        meta: item.data.timezone,
        subtitle: item.data.country,
        title: item.data.name,
        url: `/locations/${item.id}`,
      },
    });
  }

  getSortDate(_item: CollectionItem<"locations">): number {
    return 0;
  }

  getToolbarItems(item: CollectionItem<"locations">): ToolbarItem[] {
    const items: ToolbarItem[] = [{ label: "Country", type: "location", value: item.data.country }];

    if (item.data.timezone) {
      items.push({ label: "Timezone", type: "time", value: item.data.timezone });
    }

    if (item.data.region) {
      items.push({ label: "Region", type: "text", value: item.data.region });
    }

    if (item.data.city) {
      items.push({ label: "Weather", type: "weather", value: "24°C Sunny" });
    }

    return items;
  }

  getViewProps(item: CollectionItem<"locations">): Partial<ViewPageProps<"locations">> {
    return {
      description: item.data.description,
      image: item.data.gallery?.[0],
      subtitle: item.data.country,
      tags: { items: [], title: "" },
      title: item.data.name,
    };
  }
}
