import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
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

import { PROFILE } from "./src/lib/config";

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
    react(),
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
    pagefind(),

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
    shikiConfig: {
      theme: "aurora-x",
      wrap: true,
    },
    syntaxHighlight: "shiki",
  },
  output: "static",

  prefetch: true,

  site: "https://localhost:4321",
  trailingSlash: "never",

  vite: {
    plugins: [tailwindcss() as any],
  },
});
