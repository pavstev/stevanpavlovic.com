import type { APIContext } from "astro";

import rss from "@astrojs/rss";

import { SITE_DESCRIPTION, SITE_TITLE } from "../config";
import { getCollectionData } from "../lib/content";

export const GET = async (context: APIContext): Promise<Response> => {
  const posts = await getCollectionData("blog");
  return rss({
    description: SITE_DESCRIPTION,
    items: posts.map((post) => ({
      description: post.data.description,
      link: `/blog/view/${post.id}`,
      pubDate: post.data.pubDate,
      title: post.data.title,
    })),
    site: context.site ?? "",
    title: SITE_TITLE,
  });
};
