import dayjs from "dayjs";

import type { CollectionItem, CollectionName } from "./types";

import { isBlog, isExperience } from "./guards";

export const getSortDate = (item: CollectionItem<CollectionName>): number => {
  if (isBlog(item)) return dayjs(item.data.pubDate).valueOf();
  if (isExperience(item)) return dayjs(item.data.startDate).valueOf();
  return 0;
};
