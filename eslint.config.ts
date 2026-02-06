import eslint from "@eslint/js";
import markdown from "@eslint/markdown";
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
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import * as jsoncParser from "jsonc-eslint-parser";
import tseslint from "typescript-eslint";

const tsFiles = {
  files: ["**/*.ts", "**/*.tsx"],
  ignores: ["**/*.md", "**/*.mdx", "**/*.json"],
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const jsxA11yRules = jsxA11y.flatConfigs.recommended.rules as Record<string, unknown>;

const stylisticOptions = {
  arrowParens: false,
  commaDangle: "always-multiline",
  experimental: true,
  indent: 2,
  jsx: false,
  quotes: "double",
  semi: true,
  severity: "error",
} as const;

export default defineConfig(
  globalIgnores([
    "pnpm-lock.yaml",
    "dist/**/*",
    ".astro/**/*",
    "node_modules/**/*",
    ".wrangler/**/*",
    "src/env.d.ts",
    ".git/**/*",
    ".unlighthouse/**/*",
    "worker-configuration.d.ts",
  ]),
  { ...eslint.configs.recommended, ignores: ["**/*.md", "**/*.mdx"], name: "eslint" },
  {
    ...perfectionist.configs["recommended-natural"],
    ignores: ["**/*.md", "**/*.mdx"],
    name: "perfectionist",
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    ...tsFiles,
  })),
  ...eslintPluginAstro.configs.recommended.map((config) => ({
    ...config,
    ignores: tsFiles.ignores,
  })),
  {
    files: ["**/*.astro", "**/*.tsx", "**/*.jsx", "**/*.mdx"],
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
  {
    files: ["**/*.astro", "**/*.tsx", "**/*.jsx", "**/*.mdx"],
    name: "jsx-a11y",
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      "jsx-a11y": jsxA11y,
    },
    // @ts-expect-error - jsxA11yRules has broad types
    rules: jsxA11yRules,
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.astro"],
    name: "editorconfig-general",
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      editorconfig,
    },
    rules: {
      "editorconfig/charset": "error",
      "editorconfig/eol-last": "error",
      "editorconfig/linebreak-style": "error",
      "editorconfig/no-trailing-spaces": "error",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.astro"],
    name: "editorconfig-indent",
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      editorconfig,
    },
    rules: {
      "editorconfig/indent": "error",
    },
  },
  {
    ...stylistic.configs.customize(stylisticOptions),
    ...tsFiles,
    name: "stylistic",
    rules: {
      ...stylistic.configs.customize(stylisticOptions).rules,
      "@stylistic/indent": "off", // Handled by editorconfig/indent
    },
  },
  {
    ...tsFiles,
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // 4. Prefer `interface` instead of `type`
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

      // Additional "great" TypeScript and quality rules
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
          prefer: "type-imports",
        },
      ],
      // 1. Require return types to be defined in functions
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
      // 3. Remove "return" syntax where possible (implicit return)
      "arrow-body-style": ["error", "as-needed"],
      // 5. Enforce curly braces for all control statements
      curly: ["error", "all"],
      // 2. Only use arrow functions
      "func-style": ["error", "expression"],
      // 7. Enforce maximum nesting depth of 3
      "max-depth": ["error", 3],
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // 6. Forbid 'else' and 'else if'
      "no-restricted-syntax": [
        "error",
        {
          message: "Forbidden 'else' or 'else if'. Use early returns or guard clauses to keep code flat and readable.",
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
  {
    files: ["**/*.astro"],
    name: "astro",
    rules: {
      // Astro components often don't have explicit return types for the script part
      "@typescript-eslint/explicit-function-return-type": "off",
      // Stylistic rules that might conflict with Astro templates
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-floating-promises": "off",
      // Disable type-aware rules that crash in Astro frontmatter
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // Astro specific strict rules
      "astro/no-set-html-directive": "error",
      "astro/no-unused-css-selector": "error",
      "astro/no-unused-define-vars-in-style": "error",
      "astro/prefer-class-list-directive": "error",
      "astro/prefer-object-class-list": "error",
    },
  },
  {
    files: ["src/components/**/*.astro"],
    name: "components",
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{astro,ts,tsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/components/**/": "KEBAB_CASE",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.ts"],
    name: "scripts",
    rules: {
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      // Scripts often deal with raw data from APIs where types might be incomplete
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    extends: ["markdown/recommended"],
    files: ["**/*.md", "**/*.mdx"],
    language: "markdown/gfm",
    languageOptions: {
      frontmatter: "yaml",
    },
    name: "markdown",
    plugins: {
      markdown,
    },
    rules: {
      "markdown/heading-increment": "error",
      "markdown/no-bare-urls": "error",
      "markdown/no-duplicate-headings": "error",
      "markdown/no-html": "error",
      "no-irregular-whitespace": "off",
    },
  },
  {
    files: ["**/*.mdx"],
    name: "markdown-mdx-overrides",
    rules: {
      "markdown/no-html": "off",
    },
  },
  // {
  //   files: ['**/*.json'],
  //   ignores: ['package-lock.json'],
  //   plugins: { json },
  //   language: 'json/json',
  //   extends: ['json/recommended'],
  // },
  // {
  //   files: ['**/*.jsonc'],
  //   plugins: { json },
  //   language: 'json/jsonc',
  //   extends: ['json/recommended'],
  // },
  // {
  //   files: ['**/*.json5'],
  //   plugins: { json },
  //   language: 'json/json5',
  //   extends: ['json/recommended'],
  // },
  ...eslintPluginJsonSchemaValidator.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.json"],
    ignores: [".vscode/**/*"],
    languageOptions: {
      parser: jsoncParser, // Set this parser.
    },
  })),
  // Prettier must be last to override other formatting rules
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.astro", "**/*.json", "**/*.md", "**/*.mdx"],
    name: "prettier",
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      "editorconfig/indent": "off", // Prettier handles formatting
      "prettier/prettier": "error",
    },
  },
);
