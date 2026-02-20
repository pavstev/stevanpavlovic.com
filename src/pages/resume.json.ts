import type { APIRoute } from "astro";

import { getResumeData } from "../server/resume-loader.ts";

export const GET: APIRoute = async (context) => {
  const resume = await getResumeData(context.site);

  return new Response(JSON.stringify(resume, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};