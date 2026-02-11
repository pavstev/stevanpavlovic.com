import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import favicons from "astro-favicons";
import icon from "astro-icon";
import { defineConfig, envField } from "astro/config";
import { readFile } from "fs/promises";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import readingTimeRemarkPlugin from "remark-reading-time";
import remarkToc from "remark-toc";

import { PROFILE } from "./src/config";

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
    platformProxy: {
      configPath: "wrangler.jsonc",
      enabled: true,
    },
  }),
  env: {
    schema: {
      PUBLIC_STACK_DEBUG: envField.boolean({
        access: "public",
        context: "client",
        default: false,
      }),
      PUBLIC_STACK_DEFAULT_GAP: envField.number({
        access: "public",
        context: "client",
        default: 3,
      }),
    },
  },
  image: {
    remotePatterns: [{ protocol: "https" }],
  },
  integrations: [
    mdx(),
    sitemap(),
    favicons({
      input: {
        favicons: [await readFile("src/assets/profile.jpeg")],
      },
      name: PROFILE.name,
      short_name: PROFILE.name,
    }),
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    remarkPlugins: [readingTimeRemarkPlugin as any, [remarkToc, { heading: "toc", maxDepth: 3 }]],
    shikiConfig: { theme: "github-dark-dimmed" },
    syntaxHighlight: "shiki",
  },
  output: "static",
  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true,
  },
  site: "https://localhost:4321",
  trailingSlash: "never",
  vite: {
    build: {
      rollupOptions: {},
    },
    // 1. This defines __dirname as an empty string during the build,
    // preventing the "ReferenceError: __dirname is not defined" crash.
    define: {
      __dirname: JSON.stringify(""),
    },
    plugins: [tailwindcss()],
    // 2. Ensure the WASM library is properly optimized/externalized if needed.
    // (Usually the define above is enough, but this can help with strict dep handling)
    ssr: {
      noExternal: ["canvaskit-wasm"],
    },
  },
});
