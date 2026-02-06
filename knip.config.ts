import type { KnipConfig } from "knip";

const config: KnipConfig = {
  astro: {
    entry: ["src/pages/**/*.astro", "src/content/**/*.config.ts"],
  },
  entry: ["unlighthouse.config.ts", "scripts/*.ts"],
  ignoreBinaries: ["only-allow"],
  ignoreDependencies: [
    "sharp",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "astro-eslint-parser",
    "@iconify-json/mdi",
    "remark-lint-no-multiple-toplevel-headings",
    "eslint-mdx",
    "@astrojs/ts-plugin",
    "prettier-plugin-astro"
  ],
  ignore: ["src/stories/**/*", "src/lib/api-bak/**/*"]
};

export default config;