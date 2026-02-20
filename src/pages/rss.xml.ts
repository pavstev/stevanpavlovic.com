import type { APIContext } from "astro";

import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

import { SITE_CONFIG } from "../constants.ts";

export const GET = async (context: APIContext): Promise<Response> => {
  const posts = await getCollection("blog");
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    description: SITE_CONFIG.headline,
    items: sortedPosts.map((post) => ({
      description: post.data.description,
      link: `/blog/${post.id}`,
      pubDate: post.data.pubDate,
      title: post.data.title,
    })),
    site: context.site ?? "",
    title: SITE_CONFIG.title,
  });
};