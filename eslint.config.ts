import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import tailwind from "eslint-plugin-better-tailwindcss";
// @ts-expect-error No types for this
import jsxA11y from "eslint-plugin-jsx-a11y";
// @ts-expect-error No types for this
import markdownlintPlugin from "eslint-plugin-markdownlint";
// @ts-expect-error No types for this
import markdownlintParser from "eslint-plugin-markdownlint/parser.js";
import * as mdx from "eslint-plugin-mdx";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from "eslint/config";
import * as jsoncParser from "jsonc-eslint-parser";
import tseslint from "typescript-eslint";

const TS_FILES = ["**/*.ts", "**/*.tsx"];
const ASTRO_FILES = ["**/*.astro"];
const MARKDOWN_FILES = ["**/*.md"];
const MDX_FILES = ["**/*.mdx"];
const FRONTEND_FILES = ["**/*.astro", "**/*.tsx", "**/*.jsx", "**/*.mdx"];
const CONFIG_FILES = ["**/*.config.ts", "scripts/**/*.ts"];

// Fix plugins for ESLint 9/10 compatibility
const fixedJsxA11y = fixupPluginRules(jsxA11y);
const fixedTailwind = fixupPluginRules(tailwind);
const fixedMarkdownlint = fixupPluginRules(markdownlintPlugin);

if (mdx.flat?.plugins?.mdx) {
  mdx.flat.plugins.mdx = fixupPluginRules(mdx.flat.plugins.mdx);
}

export default defineConfig(
  globalIgnores([
    "pnpm-lock.yaml",
    "dist/**/*",
    ".astro/**/*",
    "node_modules/**/*",
    ".eslintcache",
    ".wrangler/**/*",
    "src/env.d.ts",
    ".git/**/*",
    ".unlighthouse/**/*",
    "worker-configuration.d.ts",
    ".vscode/**/*",
  ]),

  // ESLint comments plugin
  comments.recommended,

  // Base ESLint recommended
  eslint.configs.recommended,

  // Perfectionist - for sorting/ordering
  perfectionist.configs["recommended-natural"],

  // TypeScript recommended rules (no type checking required)
  ...tseslint.configs.recommended,

  // Astro recommended rules
  ...eslintPluginAstro.configs.recommended,

  // Tailwind CSS rules
  {
    files: FRONTEND_FILES,
    plugins: {
      "better-tailwindcss": fixedTailwind,
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "error",
      "better-tailwindcss/enforce-shorthand-classes": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-duplicate-classes": "error",
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/global.css",
      },
    },
  },

  // JSX Accessibility
  {
    files: FRONTEND_FILES.filter((f) => !f.endsWith(".astro")),
    plugins: {
      "jsx-a11y": fixedJsxA11y,
    },
    rules: jsxA11y.flatConfigs.recommended.rules,
  },

  // TypeScript strict type-checked rules (only for files in tsconfig)
  {
    files: TS_FILES,
    ignores: CONFIG_FILES,
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // Type-checked rules
      "@typescript-eslint/await-thenable": "error",
      // Code quality rules
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Astro-specific overrides
  {
    files: ASTRO_FILES,
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_|^Astro$" },
      ],
      "astro/no-set-html-directive": "error",
      "astro/no-unused-css-selector": "error",
    },
  },

  // Markdown linting
  {
    files: MARKDOWN_FILES,
    languageOptions: {
      parser: markdownlintParser,
    },
    plugins: {
      markdownlint: fixedMarkdownlint,
    },
    rules: {
      ...markdownlintPlugin.configs.recommended.rules,
      "markdownlint/md013": "off",
      "markdownlint/md024": "off",
      "markdownlint/md041": "off",
    },
  },

  // MDX support
  {
    files: MDX_FILES,
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: false,
    }),
    rules: {
      ...mdx.flat.rules,
      "mdx/remark": "error",
    },
  },

  // JSON validation
  {
    files: ["**/*.json"],
    languageOptions: {
      parser: jsoncParser,
    },
  },

  // Config files - relaxed rules (no type checking)
  {
    files: CONFIG_FILES,
    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },

  // Prettier recommended - MUST BE LAST
  eslintPluginPrettierRecommended
);
