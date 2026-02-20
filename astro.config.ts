import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
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

import { SITE_CONFIG } from "./src/constants";
import { resumeGenerator } from "./src/integrations/resume-generator";

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
    resumeGenerator(),
    mdx(),
    sitemap(),
    favicons({
      input: {
        favicons: [await readFile("src/assets/profile.jpeg")],
      },
      name: SITE_CONFIG.author,
      short_name: SITE_CONFIG.author,
    }),
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
    react(),
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
  site: "https://dev.stevanpavlovic.com",
  trailingSlash: "never",
  vite: {
    build: {
      rollupOptions: {},
    },

    define: {
      __dirname: JSON.stringify(""),
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@assets/": "./src/assets/",
        "@client/": "./src/client/",
        "@components/": "./src/components/",
        "@constants": "./src/constants.ts",
        "@server/": "./src/server/",
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },

    ssr: {
      noExternal: ["canvaskit-wasm"],
    },
  },
});
