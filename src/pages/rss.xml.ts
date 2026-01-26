import type { APIContext } from "astro";

import rss from "@astrojs/rss";

import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getSortedBlogPosts } from "../lib/content";

export const GET = async (context: APIContext): Promise<Response> => {
  const posts = await getSortedBlogPosts();
  return rss({
    description: SITE_DESCRIPTION,
    items: posts.map(post => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
    site: context.site ?? "",
    title: SITE_TITLE,
  });
};
