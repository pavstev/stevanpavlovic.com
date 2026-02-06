import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

// 1. Import the WASM binary explicitly
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm?url";

// 2. Import fonts as URLs so Vite handles the bundling/paths for us
// Note: We use the WOFF file directly from the package
import interBoldUrl from "@fontsource-variable/inter/files/inter-latin-700-normal.woff?url";
import interRegularUrl from "@fontsource-variable/inter/files/inter-latin-400-normal.woff?url";

// Initialize the Wasm module *once* (outside the handler)
let wasmInitialized = false;

const initResvg = async () => {
  if (wasmInitialized) return;

  // Fetch the WASM binary from the URL Vite provided
  const wasmModule = await fetch(resvgWasm).then((res) => res.arrayBuffer());
  await initWasm(wasmModule);
  wasmInitialized = true;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog");
  return posts.map((post) => {
    const wordCount = post.body ? post.body.split(/\s+/).length : 0;
    const readingTime = `${Math.ceil(wordCount / 200)} min read`;

    return {
      params: { slug: post.id },
      props: {
        description: post.data.description ?? "",
        readingTime,
        title: post.data.title ?? "Untitled",
      },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { description, readingTime, title } = props;

  // Ensure WASM is ready
  await initResvg();

  // 3. Load Fonts via Fetch (Standard Web API works in Cloudflare)
  const [boldFontData, regularFontData] = await Promise.all([
    fetch(interBoldUrl).then((res) => res.arrayBuffer()),
    fetch(interRegularUrl).then((res) => res.arrayBuffer()),
  ]);

  const html: Parameters<typeof satori>[0] = {
    type: "div",
    props: {
      style: {
        alignItems: "flex-start",
        backgroundColor: "#fff",
        backgroundImage: "radial-gradient(circle at 2px 2px, #f1f5f9 2px, transparent 0)",
        backgroundSize: "40px 40px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "80px",
        width: "100%",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    alignItems: "center",
                    display: "flex",
                    gap: "12px",
                    marginBottom: "40px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { backgroundColor: "#3b82f6", borderRadius: "4px", height: "8px", width: "40px" },
                      },
                    },
                    {
                      type: "span",
                      props: {
                        children: "TECHNICAL BLOG",
                        style: { color: "#64748b", fontSize: "20px", fontWeight: 700, letterSpacing: "0.1em" },
                      },
                    },
                  ],
                },
              },
              {
                type: "h1",
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
              },
              {
                type: "p",
                props: {
                  children: description,
                  style: {
                    color: "#475569",
                    fontSize: "36px",
                    lineHeight: 1.5,
                    maxWidth: "900px",
                  },
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              alignItems: "center",
              borderTop: "2px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "40px",
              width: "100%",
            },
            children: [
              {
                type: "span",
                props: {
                  children: `spcom.final • ${readingTime}`,
                  style: { color: "#94a3b8", fontSize: "24px", fontWeight: 500 },
                },
              },
              {
                type: "div",
                props: {
                  children: "stevan.dev",
                  style: { color: "#3b82f6", fontSize: "24px", fontWeight: 700 },
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(html, {
    fonts: [
      {
        name: "Inter",
        data: regularFontData,
        style: "normal",
        weight: 400,
      },
      {
        name: "Inter",
        data: boldFontData,
        style: "normal",
        weight: 700,
      },
    ],
    height: 630,
    width: 1200,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    imageRendering: 0, // optimizeSpeed
    shapeRendering: 2, // geometricPrecision
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
};