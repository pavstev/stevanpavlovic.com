import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import sentry from "@sentry/astro";
import tailwindcss from "@tailwindcss/vite";
import brokenLinksChecker from "astro-broken-links-checker";
import favicons from "astro-favicons";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { readFile } from "node:fs/promises";
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

  i18n: {
    defaultLocale: "en",
    locales: ["en", "sr"],
    routing: {
      prefixDefaultLocale: false,
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
    (await import("@playform/compress")).default(),
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
    brokenLinksChecker({
      cacheExternalLinks: true,
      checkExternalLinks: false,
      throwError: false,
    }),
    sentry({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "sp-05",
      project: "stevanpavlovic",
      telemetry: false,
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
