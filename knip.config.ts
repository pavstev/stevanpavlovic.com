import type { KnipConfig } from "knip";

const config: KnipConfig = {
  astro: {},
  entry: [
    "unlighthouse.config.ts",
    "tools/eslint/index.ts",
    "src/**/*.{test,spec}.{ts,tsx}",
    "src/test/setup.ts",
  ],
  ignoreBinaries: ["only-allow"],
  ignoreDependencies: [
    "sharp",
    "@iconify-json/*",
    "astro-eslint-parser",
    "@astrojs/check",
    "resumed",
  ],
};

export default config;
