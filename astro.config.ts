import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import playformInline from "@playform/inline";
import sentry from "@sentry/astro";
import tailwindcss from "@tailwindcss/vite";
import brokenLinksChecker from "astro-broken-links-checker";
import favicons from "astro-favicons";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import { readFile } from "node:fs/promises";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";

import { PROFILE } from "./src/config";
import { lastUpdatedRemarkPlugin, readingTimeRemarkPlugin } from "./src/lib/plugin/remark";

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
    platformProxy: {
      configPath: "wrangler.jsonc",
      enabled: true,
    },
  }),
  integrations: [
    mdx(),

    sitemap(),
    favicons({
      input: {
        favicons: [await readFile("src/assets/profile.jpeg")],
      },
      name: PROFILE.name,
      short_name: PROFILE.name.split(" ").at(0) ?? "",
    }),
    (await import("@playform/compress")).default(),
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
    pagefind({
      indexConfig: {},
    }),

    brokenLinksChecker({
      cacheExternalLinks: true,
      checkExternalLinks: false,
      throwError: false,
    }),
    playformInline(),

    sentry({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "sp-05",
      project: "stevanpavlovic",
      telemetry: false,
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    remarkPlugins: [readingTimeRemarkPlugin, lastUpdatedRemarkPlugin, [remarkToc, { heading: "toc", maxDepth: 3 }]],
    shikiConfig: { theme: "github-dark-dimmed" },
    // #10 VS-Code Caliber Syntax Highlighting
    syntaxHighlight: "shiki",
  },
  output: "static",
  prefetch: {
    defaultStrategy: "hover",
    // #20 Pre-fetching links for instant navigation
    prefetchAll: true,
  },

  site: "https://localhost:4321",
  trailingSlash: "never",

  vite: {
    plugins: [tailwindcss() as any],
  },
});
