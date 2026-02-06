import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";
import { resolveTags } from "../helpers";

export class ProjectsAdapter extends ContentAdapter<"projects"> {
  async getCardData(item: CollectionItem<"projects">): Promise<CardResult> {
    return {
      actionLabel: "View Project",
      data: {
        description: item.data.description,
        image: item.data.image,
        meta: item.data.meta,
        subtitle: item.data.subtitle,
        tags: await resolveTags(item.data.tags),
        title: item.data.title,
        url: `/projects/view/${item.id}`,
      },
    };
  }

  getToolbarItems(item: CollectionItem<"projects">): ToolbarItem[] {
    const items: ToolbarItem[] = [];

    if (item.data.subtitle) {
      items.push({ label: "Class", type: "category", value: item.data.subtitle });
    }

    items.push({
      label: "Status",
      type: "status",
      value: item.data.meta || "Active",
    });

    if (item.data.teamSize) {
      items.push({ label: "Team", type: "person", value: item.data.teamSize });
    }

    // Creative additions
    if (item.data.repoUrl) {
      items.push({ label: "Access", type: "link", value: "Public Repo" });
    }

    return items;
  }

  async getViewProps(item: CollectionItem<"projects">): Promise<Partial<ViewPageProps<"projects">>> {
    return {
      description: item.data.description,
      image: item.data.image,
      subtitle: item.data.subtitle,
      tags: {
        items: await resolveTags(item.data.tags),
        title: "Stack",
      },
      title: item.data.title,
    };
  }
}
