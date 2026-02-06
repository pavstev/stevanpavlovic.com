import { defineUnlighthouseConfig } from "unlighthouse/config";

export default defineUnlighthouseConfig({
  ["server" as keyof Parameters<typeof defineUnlighthouseConfig>[0]]: {
    open: false,
    port: 5678,
  },

  cache: true,

  ci: {
    budget: {
      accessibility: 90,
      "best-practices": 90,
      performance: 90,
      seo: 90,
    },
    buildStatic: true,
  },

  debug: false,

  outputPath: "./.unlighthouse",

  puppeteerOptions: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  },

  scanner: {
    device: "desktop",
    dynamicSampling: 5,
    exclude: ["/cdn-cgi/*", "/assets/*", "/api/*"],
    sitemap: ["/sitemap-index.xml", "/sitemap.xml"],
  },

  site: "https://spcom-final.staevage.workers.dev",
});
