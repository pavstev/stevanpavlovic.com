import type { APIRoute, GetStaticPaths } from "astro";

import { Resvg } from "@resvg/resvg-js";
import { getCollection } from "astro:content";
import fs from "node:fs";
import path from "node:path";
import satori from "satori";

/**
 * Feature #13: Dynamic OG Image Generation
 * Optimized Satori implementation using local @fontsource assets.
 */

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id || post.slug },
    props: {
      description: post.data.description ?? "",
      readingTime: post.data.readingTime ?? "5 min read",
      title: post.data.title ?? "Untitled",
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { description, readingTime, title } = props;

  const boldFontPath = path.resolve("node_modules/@fontsource-variable/inter/files/inter-latin-700-normal.woff");
  const regularFontPath = path.resolve("node_modules/@fontsource-variable/inter/files/inter-latin-400-normal.woff");

  const boldFontData = fs.readFileSync(boldFontPath);
  const regularFontData = fs.readFileSync(regularFontPath);

  const html: Parameters<typeof satori>[0] = {
    props: {
      children: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        style: { backgroundColor: "#3b82f6", borderRadius: "4px", height: "8px", width: "40px" },
                      },
                      type: "div",
                    },
                    {
                      props: {
                        children: "TECHNICAL BLOG",
                        style: { color: "#64748b", fontSize: "20px", fontWeight: 700, letterSpacing: "0.1em" },
                      },
                      type: "span",
                    },
                  ],
                  style: {
                    alignItems: "center",
                    display: "flex",
                    gap: "12px",
                    marginBottom: "40px",
                  },
                },
                type: "div",
              },
              {
                props: {
                  children: title,
                  style: {
                    color: "#0f172a",
                    fontSize: "84px",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    marginBottom: "24px",
                  },
                },
                type: "h1",
              },
              {
                props: {
                  children: description,
                  style: {
                    color: "#475569",
                    fontSize: "36px",
                    lineHeight: 1.5,
                    maxWidth: "900px",
                  },
                },
                type: "p",
              },
            ],
            style: { display: "flex", flexDirection: "column" },
          },
          type: "div",
        },
        {
          props: {
            children: [
              {
                props: {
                  children: `spcom.final • ${readingTime}`,
                  style: { color: "#94a3b8", fontSize: "24px", fontWeight: 500 },
                },
                type: "span",
              },
              {
                props: {
                  children: "stevan.dev",
                  style: { color: "#3b82f6", fontSize: "24px", fontWeight: 700 },
                },
                type: "div",
              },
            ],
            style: {
              alignItems: "center",
              borderTop: "2px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "40px",
              width: "100%",
            },
          },
          type: "div",
        },
      ],
      style: {
        alignItems: "flex-start",
        backgroundColor: "#fff",
        // Modern "grid" pattern background
        backgroundImage: "radial-gradient(circle at 2px 2px, #f1f5f9 2px, transparent 0)",
        backgroundSize: "40px 40px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
      },
    },
    type: "div",
  };

  const svg = await satori(html, {
    fonts: [
      {
        data: regularFontData,
        name: "Inter",
        style: "normal",
        weight: 400,
      },
      {
        data: boldFontData,
        name: "Inter",
        style: "normal",
        weight: 700,
      },
    ],
    height: 630,
    width: 1200,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    imageRendering: 0,
    // Optimize for text rendering
    shapeRendering: 2,
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      // Aggressive caching for static assets
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
};
