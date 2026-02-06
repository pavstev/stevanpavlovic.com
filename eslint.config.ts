import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import tailwind from "eslint-plugin-better-tailwindcss";
import checkFile from "eslint-plugin-check-file";
// @ts-expect-error - No types for this plugin
import editorconfig from "eslint-plugin-editorconfig";
import eslintPluginJsonSchemaValidator from "eslint-plugin-json-schema-validator";
// @ts-expect-error - No types for this plugin
import jsxA11y from "eslint-plugin-jsx-a11y";
// @ts-expect-error - No types for this plugin
import markdownlintPlugin from "eslint-plugin-markdownlint";
// @ts-expect-error - No types for this plugin
import markdownlintParser from "eslint-plugin-markdownlint/parser.js";
import * as mdx from "eslint-plugin-mdx";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import * as jsoncParser from "jsonc-eslint-parser";
import tseslint from "typescript-eslint";

// --- Constants & Groups ---

const TS_FILES = ["**/*.ts", "**/*.tsx"];
const ASTRO_FILES = ["**/*.astro"];
const MARKDOWN_FILES = ["**/*.md"];
const MDX_FILES = ["**/*.mdx"];
const JSON_FILES = ["**/*.json"];

const CODE_FILES = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.astro"];
const FRONTEND_FILES = ["**/*.astro", "**/*.tsx", "**/*.jsx", "**/*.mdx"];
const ALL_FILES = [...CODE_FILES, ...JSON_FILES, ...MARKDOWN_FILES, ...MDX_FILES];

const GLOBAL_IGNORES = [
  "pnpm-lock.yaml",
  "dist/**/*",
  ".astro/**/*",
  "node_modules/**/*",
  "**/.eslintcache",
  ".wrangler/**/*",
  "src/env.d.ts",
  ".git/**/*",
  ".unlighthouse/**/*",
  "worker-configuration.d.ts",
  ".vscode/**/*",
];

const STYLISTIC_OPTIONS = {
  arrowParens: false,
  commaDangle: "always-multiline",
  experimental: true,
  indent: 2,
  jsx: false,
  quotes: "double",
  semi: true,
  severity: "error",
} as const;

// --- Config ---

export default defineConfig(
  globalIgnores(GLOBAL_IGNORES),

  // Base Configs
  comments.recommended,
  {
    ...eslint.configs.recommended,
    // Explicitly ignore markdown in base JS config to prevent parsing errors
    ignores: [...MARKDOWN_FILES, ...MDX_FILES],
    name: "eslint/recommended",
  },
  {
    ...perfectionist.configs["recommended-natural"],
    ignores: [...MARKDOWN_FILES, ...MDX_FILES],
    name: "perfectionist",
  },

  // TypeScript (Strict)
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: TS_FILES,
  })),

  // Astro
  ...eslintPluginAstro.configs.recommended.map((config) => ({
    ...config,
    // Prevent Astro parser from processing plain TS/JSON/MD
    ignores: ["**/*.ts", "**/*.tsx", ...MARKDOWN_FILES, ...JSON_FILES],
  })),

  // Tailwind
  {
    files: FRONTEND_FILES,
    name: "tailwindcss",
    plugins: {
      "better-tailwindcss": tailwind,
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "error",
      "better-tailwindcss/enforce-consistent-important-position": "error",
      "better-tailwindcss/enforce-consistent-variable-syntax": "error",
      "better-tailwindcss/enforce-shorthand-classes": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-deprecated-classes": "error",
      "better-tailwindcss/no-duplicate-classes": "error",
      "better-tailwindcss/no-unnecessary-whitespace": "warn",
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/global.css",
      },
    },
  },

  // JSX A11y
  {
    files: FRONTEND_FILES,
    name: "jsx-a11y",
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: jsxA11y.flatConfigs.recommended.rules,
  },

  // EditorConfig (Consolidated)
  {
    files: CODE_FILES,
    name: "editorconfig",
    plugins: {
      editorconfig,
    },
    rules: {
      "editorconfig/charset": "error",
      "editorconfig/eol-last": "error",
      "editorconfig/indent": "error",
      "editorconfig/linebreak-style": "error",
      "editorconfig/no-trailing-spaces": "error",
    },
  },

  // Stylistic
  {
    files: TS_FILES,
    name: "stylistic",
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      ...stylistic.configs.customize(STYLISTIC_OPTIONS).rules,
      "@stylistic/indent": "off", // Handled by editorconfig
    },
  },

  // TypeScript Rules & Overrides
  {
    files: TS_FILES,
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    name: "typescript/overrides",
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "arrow-body-style": ["error", "as-needed"],
      curly: ["error", "all"],
      "func-style": ["error", "expression"],
      "max-depth": ["error", 3],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-restricted-syntax": [
        "error",
        {
          message: "Forbidden 'else' or 'else if'. Use early returns or guard clauses.",
          selector: "IfStatement[alternate]",
        },
        {
          message: "Forbidden '.forEach'. Use 'for...of' loop or '.map()' instead.",
          selector: "CallExpression[callee.property.name='forEach']",
        },
      ],
      "no-unused-vars": "off",
      "prefer-arrow-callback": "error",
    },
  },

  // Astro Specifics
  {
    files: ASTRO_FILES,
    name: "astro/overrides",
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "astro/no-set-html-directive": "error",
      "astro/no-unused-css-selector": "error",
      "astro/no-unused-define-vars-in-style": "error",
      "astro/prefer-class-list-directive": "error",
      "astro/prefer-object-class-list": "error",
    },
  },

  // Components (Naming)
  {
    files: ["src/components/**/*.astro"],
    name: "components/naming",
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{astro,ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": ["error", { "src/components/**/": "KEBAB_CASE" }],
    },
  },

  // Scripts (Loose Typing)
  {
    // CAUTION: Changed from "**/*.ts" to specific script folders.
    // Targeting "**/*.ts" here would disable strict type checking for your ENTIRE project.
    files: ["scripts/**/*.ts", "**/*.config.ts"],
    name: "scripts/overrides",
    rules: {
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },

  // Markdown (Linting)
  {
    files: MARKDOWN_FILES,
    languageOptions: {
      parser: markdownlintParser,
    },
    plugins: {
      markdownlint: markdownlintPlugin,
    },
    rules: {
      ...markdownlintPlugin.configs.recommended.rules,
      "markdownlint/md013": "off", // Line length
      "markdownlint/md041": "off", // First line H1
    },
  },
  {
    files: ["src/content/**/*.{md,mdx}"],
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      languageMapper: {},
      lintCodeBlocks: true,
    }),
    rules: {
      "mdx/remark": [
        "error",
        {
          plugins: [
            [
              "remark-lint-frontmatter-schema",
              {
                schemas: {
                  "src/schemas/blog.json": ["src/content/blog/**/*.{md,mdx}"],
                  "src/schemas/docs.json": ["src/content/docs/**/*.{md,mdx}"],
                },
              },
            ],
          ],
        },
      ],
    },
  },

  // JSON Schema
  ...eslintPluginJsonSchemaValidator.configs.recommended.map((config) => ({
    ...config,
    files: JSON_FILES,
    ignores: [".vscode/**/*"],
    languageOptions: {
      parser: jsoncParser,
    },
  })),

  // Prettier (Must be last)
  {
    files: ALL_FILES,
    name: "prettier",
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      "editorconfig/indent": "off",
      "prettier/prettier": "error",
    },
  },
);
