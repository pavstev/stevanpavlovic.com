import type { FlatConfig, RuleMetaDataDocs } from "@typescript-eslint/utils/ts-eslint";
import type { Linter } from "eslint";

import { locate } from "@iconify/json";
import { ESLintUtils } from "@typescript-eslint/utils";
import * as fs from "node:fs";

import pkgJson from "../../../package.json" with { type: "json" };

const iconSetCache = new Map<string, IconifyJSON | null>();

export const getIconSet = (prefix: string): IconifyJSON | null => {
  if (iconSetCache.has(prefix)) {
    return iconSetCache.get(prefix) ?? null;
  }

  try {
    const filename = locate(prefix);
    if (!filename) {
      iconSetCache.set(prefix, null);
      return null;
    }

    const data: IconifyJSON = JSON.parse(fs.readFileSync(filename, "utf8"));
    iconSetCache.set(prefix, data);
    return data;
  } catch {
    iconSetCache.set(prefix, null);
    return null;
  }
};

const getLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const findBestMatch = (name: string, collection: IconifyJSON): null | string => {
  const candidates = [
    ...Object.keys(collection.icons),
    ...(collection.aliases ? Object.keys(collection.aliases) : []),
  ];
  let bestMatch: null | string = null;
  let minDistance = Infinity;

  for (const candidate of candidates) {
    if (Math.abs(candidate.length - name.length) > 2) continue;
    const distance = getLevenshteinDistance(name, candidate);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = candidate;
    }
  }

  return minDistance <= 2 ? bestMatch : null;
};

type CustomMetadataDocs = RuleMetaDataDocs & {
  recommended?: boolean;
};

type EslintPlugin = NonNullable<Linter.Config["plugins"]>[string];
type EslintRule = NonNullable<EslintPlugin["rules"]>[string];
type NamedPlugin = FlatConfig.Plugin & {
  meta: NonNullable<FlatConfig.Plugin["meta"]> & {
    name: string;
  };
};
type NamedPluginWithConfigs = NamedPlugin & {
  configs: {
    recommended: Linter.Config;
  };
};
type ProjectOptions = {
  extensions: string[];
  sourceDirectories: string[];
};
type RegisterPluginOptions = {
  name: string;
  project: ProjectOptions;
  rules: TSEslintRule[];
};

type TSEslintRule = ReturnType<typeof createRule>;

export const registerPlugin = ({
  name,
  project,
  rules: tsRules,
}: RegisterPluginOptions): NamedPluginWithConfigs => {
  const rules = Object.fromEntries(
    tsRules.map((rule): [string, EslintRule] => [rule.name, rule as unknown as EslintRule])
  );

  const basePlugin: EslintPlugin & NamedPlugin = {
    meta: {
      name,
      version: pkgJson.version,
    },
    rules,
  };

  const recommendedRules = Object.fromEntries(
    tsRules
      .filter((rule) => !!(rule.meta.docs as CustomMetadataDocs | undefined)?.recommended)
      .map((rule): [string, FlatConfig.RuleLevel] => [rule.name, "error"])
  );

  return {
    ...basePlugin,
    configs: {
      recommended: {
        files: project.sourceDirectories.map(
          (dir) => `${dir}/**/*.{${project.extensions.join(",")}`
        ),
        name: `${name}/recommended`,
        plugins: {
          [name]: basePlugin,
        },
        rules: recommendedRules,
      },
    },
  };
};

export const createRule = ESLintUtils.RuleCreator<CustomMetadataDocs>(
  (name) => `https://github.com/pavstev/eslint-rules/${name}`
);

export type MessageIds = "collectionNotFound" | "iconNotFound" | "missingPrefix" | "suggestIcon";

export type Options = [
  {
    componentName?: string;
    propName?: string;
  },
];

type IconifyJSON = {
  aliases?: Record<string, unknown>;
  icons: Record<string, unknown>;
};
