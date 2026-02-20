import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";
import { getProjects, workspaceRoot } from "@nx/devkit";
import { FsTree } from "nx/src/generators/tree";

const scopes = getProjects(new FsTree(workspaceRoot, false)).map(([id]) => ({
  id,
}));

const commitTypes = {
  feat: { title: "Features", description: "A new feature" },
  fix: { title: "Bug Fixes", description: "A bug fix" },
  build: {
    title: "Builds",
    description: "Changes that affect the build system or external dependencies",
  },
  chore: {
    title: "Chores",
    description: "Other changes that don't modify src or test files",
  },
  ci: {
    title: "CI",
    description: "Changes to CI configuration files and scripts",
  },
  docs: { title: "Documentation", description: "Documentation only changes" },
  style: {
    title: "Styles",
    description:
      "Changes that do not affect the meaning of the code (white-space, formatting, etc)",
  },
  refactor: {
    title: "Code Refactoring",
    description: "A code change that neither fixes a bug nor adds a feature",
  },
  perf: {
    title: "Performance Improvements",
    description: "A code change that improves performance",
  },
  test: {
    title: "Tests",
    description: "Adding missing tests or correcting existing tests",
  },
  revert: { title: "Reverts", description: "Reverts a previous commit" },
  foo: { title: "Foo", description: "Example type" }, // From one config
} as const;

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: "conventional-changelog-atom",
  formatter: "@commitlint/format",
  rules: {
    "header-max-length": [RuleConfigSeverity.Error, "always", 72],
    "scope-enum": [RuleConfigSeverity.Error, "always", scopes.map((s) => s.id)],
    "scope-case": [RuleConfigSeverity.Error, "always", "kebab-case"],
    "type-enum": [RuleConfigSeverity.Error, "always", Object.keys(commitTypes)],
    "type-empty": [RuleConfigSeverity.Error, "never"],
    "scope-empty": [RuleConfigSeverity.Error, "never"],
    "subject-empty": [RuleConfigSeverity.Error, "never"],
    "body-max-line-length": [RuleConfigSeverity.Warning, "always", 400],
    "footer-max-line-length": [RuleConfigSeverity.Warning, "always", 400],
  },
  prompt: {
    questions: {
      type: {
        description: "What is the type of this change",
        enum: commitTypes,
      },
      scope: {
        description: "What is the scope of this change",
        enum: Object.fromEntries(
          getProjects(new FsTree(workspaceRoot, false))
            .entries()
            .map(([id, project]) => [
              id,
              {
                name: id,
                title: project.name,
                description: project.metadata?.description ?? "No description",
              },
            ])
        ),
      },
    },
  },
};

export default Configuration;
