import type { KnipConfig } from "knip";

const config: KnipConfig = {
  astro: {},
  entry: [
    "unlighthouse.config.ts",
    "tools/eslint/index.ts",
    "src/**/*.{test,spec}.{ts,tsx}",
    "src/components/ui/*.tsx",
  ],
  ignoreBinaries: ["only-allow", "go"],
  ignoreDependencies: [
    "sharp",
    "@iconify-json/*",
    "astro-eslint-parser",
    "@astrojs/check",
    "resumed",
    "wrangler",
  ],
  vitest: {},
};

export default config;
