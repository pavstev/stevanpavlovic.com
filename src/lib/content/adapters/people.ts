import { getEntry } from "astro:content";

import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";

export class PeopleAdapter extends ContentAdapter<"people"> {
  public getCardData(item: CollectionItem<"people">): CardResult {
    return {
      actionLabel: "View Profile",
      data: {
        description: item.data.description,
        image: item.data.avatar,
        subtitle: item.data.title,
        title: `${item.data.firstName} ${item.data.lastName}`,
        url: `/people/view/${item.id}`,
      },
    };
  }

  public async getToolbarItems(item: CollectionItem<"people">): Promise<ToolbarItem[]> {
    const items: ToolbarItem[] = [];

    if (item.data.location) {
      const loc = await getEntry(item.data.location);
      if (loc) {
        items.push({ label: "Base", type: "location", value: loc.data.name });
      }
    }

    if (item.data.title) {
      items.push({ label: "Role", type: "text", value: item.data.title });
    }

    // Creative additions
    items.push({ label: "Status", type: "status", value: "Networking" });

    return items;
  }

  public getViewProps(item: CollectionItem<"people">): Partial<ViewPageProps<"people">> {
    return {
      description: item.data.description,
      image: item.data.avatar,
      subtitle: item.data.title,
      tags: { items: [], title: "" },
      title: `${item.data.firstName} ${item.data.lastName}`,
    };
  }
}
