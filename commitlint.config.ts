import type { UserConfig } from "@commitlint/types";

import { RuleConfigSeverity } from "@commitlint/types";

const commitTypes = {
  build: {
    description: "Changes that affect the build system or external dependencies",
    title: "Builds",
  },
  chore: {
    description: "Other changes that don't modify src or test files",
    title: "Chores",
  },
  ci: {
    description: "Changes to CI configuration files and scripts",
    title: "CI",
  },
  docs: { description: "Documentation only changes", title: "Documentation" },
  feat: { description: "A new feature", title: "Features" },
  fix: { description: "A bug fix", title: "Bug Fixes" },
  perf: {
    description: "A code change that improves performance",
    title: "Performance Improvements",
  },
  refactor: {
    description: "A code change that neither fixes a bug nor adds a feature",
    title: "Code Refactoring",
  },
  revert: { description: "Reverts a previous commit", title: "Reverts" },
  style: {
    description:
      "Changes that do not affect the meaning of the code (white-space, formatting, etc)",
    title: "Styles",
  },
  test: {
    description: "Adding missing tests or correcting existing tests",
    title: "Tests",
  },
} as const;

const scopes = {
  all: {
    description: "Changes that affect the build system or external dependencies",
    emoji: "🌍",
    title: "All",
  },
  blog: {
    description: "Changes that affect the build system or external dependencies",
    emoji: "�",
    title: "Blog",
  },
  portfolio: {
    description: "Changes that affect the build system or external dependencies",
    emoji: "�",
    title: "Portfolio",
  },
  repokit: {
    description: "Changes that affect the build system or external dependencies",
    emoji: "�",
    title: "RepoKit",
  },
  resume: {
    description: "Changes that affect the build system or external dependencies",
    emoji: "📄",
    title: "Resume",
  },
} as const;

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  formatter: "@commitlint/format",
  parserPreset: "conventional-changelog-atom",
  prompt: {
    questions: {
      scope: {
        description: "What is the scope of this change",
        enum: scopes,
      },
      type: {
        description: "What is the type of this change",
        enum: commitTypes,
      },
    },
  },
  rules: {
    "body-max-line-length": [RuleConfigSeverity.Warning, "always", 400],
    "footer-max-line-length": [RuleConfigSeverity.Warning, "always", 400],
    "header-max-length": [RuleConfigSeverity.Error, "always", 72],
    "scope-case": [RuleConfigSeverity.Error, "always", "kebab-case"],
    "scope-empty": [RuleConfigSeverity.Error, "never"],
    "scope-enum": [RuleConfigSeverity.Error, "always", Object.keys(scopes)],
    "subject-empty": [RuleConfigSeverity.Error, "never"],
    "type-empty": [RuleConfigSeverity.Error, "never"],
    "type-enum": [RuleConfigSeverity.Error, "always", Object.keys(commitTypes)],
  },
};

export default Configuration;
