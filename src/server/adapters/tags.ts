import {
  type CardResult,
  type CollectionItem,
  ContentAdapter,
  type ToolbarItem,
  type ViewPageProps,
} from "../types";

export class TagsAdapter extends ContentAdapter<"tags"> {
  async getCardData(item: CollectionItem<"tags">): Promise<CardResult> {
    return {
      actionLabel: "View Tag",
      data: {
        description: item.data.description,
        title: item.data.label,
        url: `/tags/${item.id}`,
      },
    };
  }

  getSortDate(_item: CollectionItem<"tags">): number {
    return 0;
  }

  getToolbarItems(_item: CollectionItem<"tags">): ToolbarItem[] {
    return [];
  }

  async getViewProps(item: CollectionItem<"tags">): Promise<Partial<ViewPageProps<"tags">>> {
    return {
      description: item.data.description,
      tags: { items: [], title: "" },
      title: item.data.label,
    };
  }
}
