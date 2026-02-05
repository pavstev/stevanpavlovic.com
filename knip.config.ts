import type { KnipConfig } from "knip";

const config: KnipConfig = {
  astro: {},
  entry: [
    "unlighthouse.config.ts",
  ],
  ignoreBinaries: ["only-allow"],
  ignoreDependencies: [
    "sharp",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "astro-eslint-parser",
    "@iconify-json/mdi",
  ],
};

export default config;
