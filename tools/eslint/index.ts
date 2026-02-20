import { rule as validateIconNameRule } from "./rules/validate-icon-name";
export { registerPlugin } from "./rules/utils";

export const allRules = [validateIconNameRule];

export const files = {
  ASTRO: ["**/*.astro"],
  CONFIG: ["**/*.config.ts", "scripts/**/*.ts"],
  ESLINT: ["tools/eslint/**/*.ts"],
  FRONTEND: ["**/*.astro", "**/*.tsx", "**/*.jsx", "**/*.mdx"],
  JSON: ["**/*.json"],
  MARKDOWN: ["**/*.md"],
  MDX: ["**/*.mdx"],
  REACT: ["src/components/**/*.tsx"],
  TS: ["**/*.ts", "**/*.tsx"],
  UI_COMPONENTS: ["src/components/ui/**/*.tsx"],
} satisfies Record<string, readonly string[]>;

export const globalIgnoresList = [
  "pnpm-lock.yaml",
  "**/dist/**/*",
  ".astro/**/*",
  "node_modules/**/*",
  ".eslintcache",
  ".wrangler/**/*",
  "src/env.d.ts",
  ".git/**/*",
  ".unlighthouse/**/*",
  "worker-configuration.d.ts",
  ".vscode/**/*",
  "backup/**/*",
];
