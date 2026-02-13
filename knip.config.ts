import type { KnipConfig } from "knip";

const config: KnipConfig = {
  astro: {
    // entry: ["src/pages/**/*.astro", "src/content/**/*.config.ts"],
  },
  entry: ["unlighthouse.config.ts"],
  ignoreBinaries: ["only-allow"],
  ignoreDependencies: [
    "sharp",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "astro-eslint-parser",
    "@iconify-json/mdi",
    "@iconify-json/lucide",
    "remark-lint-no-multiple-toplevel-headings",
    "eslint-mdx",
    "react-hook-form",
    "@tanstack/zod-form-adapter",
  ],
  ignoreFiles: [
    "src/components/ui/form.tsx",
    "src/components/ui/label.tsx",
    "src/components/ui/magic-card.tsx",
  ],
};

export default config;
