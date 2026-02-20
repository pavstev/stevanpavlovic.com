import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import tailwind from "eslint-plugin-better-tailwindcss";
import importPlugin from "eslint-plugin-import";
// @ts-expect-error "no types"
import markdownlintPlugin from "eslint-plugin-markdownlint";
// @ts-expect-error "no types"
import markdownlintParser from "eslint-plugin-markdownlint/parser.js";
import * as mdx from "eslint-plugin-mdx";
// @ts-expect-error "no types"
import noComments from "eslint-plugin-no-comments";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import * as jsoncParser from "jsonc-eslint-parser";
import tseslint from "typescript-eslint";

import { allRules, files, globalIgnoresList, registerPlugin } from "./tools/eslint";

const localPlugin = registerPlugin({
  name: "local",
  project: {
    extensions: ["astro", "tsx", "ts"],
    sourceDirectories: ["src"],
  },
  rules: allRules,
});

const fixedTailwind = fixupPluginRules(tailwind);
const fixedMarkdownlint = fixupPluginRules(markdownlintPlugin);
const fixedNoComments = fixupPluginRules(noComments);
const fixedReact = fixupPluginRules(reactPlugin);

if (mdx.flat?.plugins?.mdx) {
  mdx.flat.plugins.mdx = fixupPluginRules(mdx.flat.plugins.mdx);
}

export default defineConfig(
  globalIgnores(globalIgnoresList),

  eslint.configs.recommended,

  perfectionist.configs["recommended-natural"],

  ...tseslint.configs.recommended,

  localPlugin.configs.recommended,
  {
    files: files.FRONTEND,
    plugins: {
      import: importPlugin,
      "no-comments": fixedNoComments,
      unicorn,
    },
    rules: {
      "no-comments/disallowComments": "error",
      "no-restricted-syntax": [
        "error",
        {
          message: "Use inline 'export const' instead of grouped exports.",
          selector: "ExportNamedDeclaration[specifiers.length > 0]",
        },
      ],
      "perfectionist/sort-exports": ["error", { order: "asc", type: "alphabetical" }],
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
    },
  },
  {
    files: files.ESLINT,
    name: "tools-eslint",
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/extensions": ["error", "ignorePackages"],
    },
  },

  ...eslintPluginAstro.configs.recommended,

  {
    files: files.FRONTEND,
    plugins: {
      "better-tailwindcss": fixedTailwind,
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "off",
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

  {
    files: files.TS,
    ignores: files.CONFIG,
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/await-thenable": "error",
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
  {
    files: files.UI_COMPONENTS,
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  {
    files: files.REACT,
    plugins: {
      react: fixedReact,
    },
    rules: {
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  {
    files: files.ASTRO,
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

  {
    files: files.MARKDOWN,
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

  {
    files: files.MDX,
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: false,
    }),
    rules: {
      ...mdx.flat.rules,
      "mdx/remark": "error",
    },
  },

  {
    files: files.MDX,
    languageOptions: {
      globals: {
        alert: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  {
    files: files.JSON,
    languageOptions: {
      parser: jsoncParser,
    },
  },

  {
    files: files.CONFIG,
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
      "no-comments/disallowComments": "off",
    },
  },

  {
    files: files.FRONTEND,
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },

  eslintConfigPrettier
);
