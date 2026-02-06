import type { APIRoute, GetStaticPaths } from "astro";

import { Resvg } from "@resvg/resvg-js";
import { getCollection } from "astro:content";
import satori from "satori";

/**
 * Feature #13: Dynamic OG Image Generation
 * This endpoint generates a 1200x630 PNG for every markdown post.
 */

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      description: post.data.description,
      // Using the data injected by our Remark plugins
      readingTime: post.data.readingTime || "5 min read",
      title: post.data.title,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { description, readingTime, title } = props;

  // Define the HTML structure for the OG Image
  const html = {
    props: {
      children: [
        {
          props: {
            children: [
              {
                props: {
                  children: "Documentation",
                  style: {
                    color: "#3b82f6",
                    fontSize: 24,
                    fontWeight: "bold",
                    letterSpacing: "0.1em",
                    marginBottom: 20,
                    textTransform: "uppercase",
                  },
                },
                type: "div",
              },
              {
                props: {
                  children: title,
                  style: {
                    color: "#0f172a",
                    fontSize: 72,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: 24,
                  },
                },
                type: "h1",
              },
              {
                props: {
                  children: description,
                  style: {
                    color: "#475569",
                    display: "-webkit-box",
                    fontSize: 32,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    webkitBoxOrient: "vertical",
                    webkitLineClamp: 2,
                  },
                },
                type: "p",
              },
            ],
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
          },
          type: "div",
        },
        {
          props: {
            children: readingTime,
            style: {
              color: "#94a3b8",
              fontSize: 24,
              fontWeight: 500,
              marginTop: "auto",
            },
          },
          type: "div",
        },
      ],
      style: {
        backgroundColor: "#fff",
        backgroundImage: "radial-gradient(circle at 25px 25px, #e2e8f0 2%, transparent 0%)",
        backgroundSize: "50px 50px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        padding: "80px",
        width: "100%",
      },
    },
    type: "div",
  };

  // 1. Generate SVG from HTML
  const svg = await satori(html as any, {
    // Note: You should load a real font buffer here for production
    fonts: [],
    height: 630,
    width: 1200,
  });

  // 2. Convert SVG to PNG
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
