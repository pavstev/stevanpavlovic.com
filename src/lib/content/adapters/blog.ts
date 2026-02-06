import dayjs from "dayjs";

import type { CollectionItem, ToolbarItem, ViewPageProps } from "../types";

import { type CardResult, ContentAdapter } from "../adapter";
import { resolveTags } from "../helpers";

export class BlogAdapter extends ContentAdapter<"blog"> {
  async getCardData(item: CollectionItem<"blog">): Promise<CardResult> {
    return {
      actionLabel: "Read Article",
      data: {
        date: item.data.pubDate,
        description: item.data.description,
        image: item.data.image,
        tags: await resolveTags(item.data.tags),
        title: item.data.title,
        url: `/blog/view/${item.id}`,
      },
    };
  }

  getSortDate(item: CollectionItem<"blog">): number {
    return item.data.pubDate.valueOf();
  }

  getToolbarItems(item: CollectionItem<"blog">): ToolbarItem[] {
    const wordCount = item.body ? item.body.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200);

    return [
      {
        label: "Published",
        type: "date",
        value: dayjs(item.data.pubDate).format("MMM D, YYYY"),
      },
      {
        label: "Time",
        type: "time",
        value: `${readingTime} min read`,
      },
      {
        label: "Words",
        type: "text",
        value: `${wordCount} words`,
      },
    ];
  }

  async getViewProps(item: CollectionItem<"blog">): Promise<Partial<ViewPageProps<"blog">>> {
    return {
      description: item.data.description,
      image: item.data.image,
      tags: {
        items: await resolveTags(item.data.tags),
        title: "Topics",
      },
      title: item.data.title,
    };
  }
}
