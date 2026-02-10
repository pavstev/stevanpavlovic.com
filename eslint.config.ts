import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import tailwind from "eslint-plugin-better-tailwindcss";
import checkFile from "eslint-plugin-check-file";
// @ts-expect-error No types for this
import editorconfig from "eslint-plugin-editorconfig";
import eslintPluginJsonSchemaValidator from "eslint-plugin-json-schema-validator";
// @ts-expect-error No types for this
import jsxA11y from "eslint-plugin-jsx-a11y";
// @ts-expect-error No types for this
import markdownlintPlugin from "eslint-plugin-markdownlint";
// @ts-expect-error No types for this
import markdownlintParser from "eslint-plugin-markdownlint/parser.js";
import * as mdx from "eslint-plugin-mdx";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import * as jsoncParser from "jsonc-eslint-parser";
import * as fs from "node:fs";
import * as path from "node:path";
import tseslint from "typescript-eslint";

const TS_FILES = ["**/*.ts", "**/*.tsx"];
const ASTRO_FILES = ["**/*.astro"];
const MARKDOWN_FILES = ["**/*.md"];
const MDX_FILES = ["**/*.mdx"];
const JSON_FILES = ["**/*.json"];

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "src/content");
const ASTRO_COLLECTIONS_DIR = path.join(ROOT, ".astro/collections");


const MDX_CODE_BLOCKS = ["**/*.md/*.ts", "**/*.md/*.tsx", "**/*.mdx/*.ts", "**/*.mdx/*.tsx"];

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
  "**/.agent/**/*",
  // TODO: IMPORTANT
  // "**/*.mdx", // Removed to enable MDX linting
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

let _remarkSchemas: Record<string, string[]> = {};

try {
  if (fs.existsSync(CONTENT_DIR)) {
    const collections = fs
      .readdirSync(CONTENT_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    _remarkSchemas = collections.reduce<Record<string, string[]>>((acc, collection) => {
      const schemaPath = path.join(ASTRO_COLLECTIONS_DIR, `${collection}.schema.json`);
      // We use absolute globs here to match absolute paths provided by ESLint
      acc[schemaPath] = [path.join(CONTENT_DIR, collection, "**/*.{md,mdx}")];
      return acc;
    }, {});

    if (Object.keys(_remarkSchemas).length > 0) {
      console.warn("✅ ESLint: Loaded", Object.keys(_remarkSchemas).length, "content schemas.");
    }
  }
} catch (error) {
  console.warn("⚠️ ESLint: Could not generate dynamic content schemas:", error);
}

const fixupPlugin = (plugin: any): any => {
  if (!plugin) {
    return plugin;
  }

  // Use the official fixup if possible
  const fixed = fixupPluginRules(plugin);

  if (!fixed.rules) {
    return fixed;
  }

  const newPlugin = { ...fixed };
  newPlugin.rules = { ...fixed.rules };

  for (const ruleName in newPlugin.rules) {
    const originalRule = newPlugin.rules[ruleName];
    if (!originalRule || typeof originalRule.create !== "function") {
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalCreate = originalRule.create;
    newPlugin.rules[ruleName] = {
      ...originalRule,
      create(context: any): any {
        const proxyContext = new Proxy(context, {
          get(target, prop, receiver): any {
            // ESLint 10 removed many properties from context
            if (prop === "getFilename") {
              return (): string => target.filename;
            }
            if (prop === "getPhysicalFilename") {
              return (): string => target.physicalFilename;
            }
            if (prop === "getSourceCode") {
              return (): any => target.sourceCode;
            }
            if (prop === "getCwd") {
              return (): string => target.cwd;
            }
            if (prop === "getScope") {
              return (): any => target.scope;
            }
            if (prop === "getAncestors") {
              return (): any[] => target.ancestors;
            }
            if (prop === "parserOptions") {
              return target.languageOptions?.parserOptions || {};
            }
            if (prop === "getDeclaredVariables") {
              return (node: any): any[] => target.sourceCode.getDeclaredVariables(node);
            }
            return Reflect.get(target, prop, receiver);
          },
        });
        return originalCreate.call(undefined, proxyContext);
      },
    };
  }
  return newPlugin;
};


if (mdx.flat.plugins?.mdx) {
  mdx.flat.plugins.mdx = fixupPlugin(mdx.flat.plugins.mdx);
}

const fixedMarkdownlintPlugin = fixupPlugin(markdownlintPlugin);
const fixedEditorconfig = fixupPlugin(editorconfig);
const fixedTailwind = fixupPlugin(tailwind);
const fixedCheckFile = fixupPlugin(checkFile);
const fixedJsxA11y = fixupPlugin(jsxA11y);
const fixedEslintPluginJsonSchemaValidator = fixupPlugin(eslintPluginJsonSchemaValidator);
const fixedAstro = fixupPlugin(eslintPluginAstro);
const fixedPerfectionist = fixupPlugin(perfectionist);
const fixedTseslint = fixupPlugin(tseslint.plugin);

export default defineConfig(
  globalIgnores(GLOBAL_IGNORES),

  comments.recommended,
  {
    ...eslint.configs.recommended,
    ignores: [...MARKDOWN_FILES, ...MDX_FILES],
    name: "eslint/recommended",
  },

  {
    ...fixedPerfectionist.configs["recommended-natural"],
    ignores: [...MARKDOWN_FILES, ...MDX_FILES],
    name: "perfectionist",
  },

  ...tseslint.configs.strictTypeChecked.map((config: any) => ({
    ...config,
    files: TS_FILES,
    ignores: MDX_CODE_BLOCKS,
    plugins: {
      ...config.plugins,
      "@typescript-eslint": fixedTseslint,
    },
  })),

  ...fixedAstro.configs.recommended.map((config: any) => ({
    ...config,
    ignores: ["**/*.ts", "**/*.tsx", ...MARKDOWN_FILES, ...JSON_FILES],
  })),

  {
    files: FRONTEND_FILES,
    name: "tailwindcss",
    plugins: {
      "better-tailwindcss": fixedTailwind,
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
    files: FRONTEND_FILES.filter((f) => !f.endsWith(".astro")),
    name: "jsx-a11y",
    plugins: {
      "jsx-a11y": fixedJsxA11y,
    },
    rules: jsxA11y.flatConfigs.recommended.rules,
  },

  {
    files: CODE_FILES,
    name: "editorconfig",
    plugins: {
      editorconfig: fixedEditorconfig,
    },
    rules: {
      "editorconfig/charset": "error",
      "editorconfig/eol-last": "error",
      "editorconfig/indent": "error",
      "editorconfig/linebreak-style": "error",
      "editorconfig/no-trailing-spaces": "error",
    },
  },

  {
    files: TS_FILES,
    name: "stylistic",
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      ...stylistic.configs.customize(STYLISTIC_OPTIONS).rules,
      "@stylistic/indent": "off",
    },
  },

  {
    files: TS_FILES,
    // Explicitly ignore MDX code blocks here to avoid "file not in tsconfig" errors
    ignores: MDX_CODE_BLOCKS,
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
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/restrict-template-expressions": "off",
      "arrow-body-style": ["error", "as-needed"],
      curly: ["error", "all"],
      "func-style": ["error", "expression"],
      "max-depth": ["error", 4],
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
      "no-unused-vars": "off",
    },
  },

  {
    files: ["src/components/**/*.astro"],
    name: "components/naming",
    plugins: {
      "check-file": fixedCheckFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "off",
        { "**/*.{astro,ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": ["error", { "src/components/**/": "KEBAB_CASE" }],
    },
  },

  {
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

  {
    files: MARKDOWN_FILES,
    languageOptions: {
      parser: markdownlintParser,
    },
    plugins: {
      markdownlint: fixedMarkdownlintPlugin,
    },
    rules: {
      ...markdownlintPlugin.configs.recommended.rules,
      "markdownlint/md012": "off",
      "markdownlint/md013": "off",
      "markdownlint/md024": "off",
      "markdownlint/md041": "off",
    },
  },

  {
    // Unified MDX / Markdown configuration
    files: MDX_FILES,
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: false,
      remarkPlugins: [
        "remark-frontmatter",
        ["remark-lint-frontmatter-schema", { schemas: _remarkSchemas }],
        "remark-lint-no-multiple-toplevel-headings",
      ],
    } as any),
    rules: {
      ...mdx.flat.rules,
      "mdx/remark": "error",
    },
  },

  ...fixedEslintPluginJsonSchemaValidator.configs.recommended.map((config: any) => ({
    ...config,
    files: JSON_FILES,
    ignores: [".vscode/**/*"],
    languageOptions: {
      parser: jsoncParser,
    },
  })),

  {
    files: ALL_FILES,
    ignores: ["**/*.mdx", "**/*.astro"],
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
