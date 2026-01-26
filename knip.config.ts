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
    "eslint-plugin-jsx-a11y",
    "@iconify-json/mdi",
  ],
};

export default config;
