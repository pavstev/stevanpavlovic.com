import type { RemarkPlugin } from "@astrojs/markdown-remark";

import { toString } from "mdast-util-to-string";
import readingTime from "reading-time";

interface AstroData {
  astro: {
    frontmatter: Record<string, unknown>;
  };
}

export const readingTimeRemarkPlugin: RemarkPlugin = () => (tree, file) => {
  const textOnPage = toString(tree);
  const readingTimeData = readingTime(textOnPage);
  const data = file.data as AstroData;
  data.astro.frontmatter.readingTime = readingTimeData.text;
};
