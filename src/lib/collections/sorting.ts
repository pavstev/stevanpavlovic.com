import dayjs from "dayjs";

import type { CollectionItem, CollectionKey } from "./types";

import { isBlog, isExperience } from "./guards";

export const getSortDate = (item: CollectionItem<CollectionKey>): number => {
  if (isBlog(item)) return dayjs(item.data.pubDate).valueOf();
  if (isExperience(item)) return dayjs(item.data.startDate).valueOf();
  return 0;
};
