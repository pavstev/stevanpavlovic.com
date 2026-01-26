import { simpleGit } from "simple-git";

import { runInParallel, runSafe } from "./lib/execution.ts";
import { deleteEmptyDirs } from "./lib/fs.ts";
import { cleanUntracked, isGitClean } from "./lib/git.ts";

void runSafe("clean", async (ctx) => {
  const git = simpleGit(ctx.cwd);

  if (!(await isGitClean(git))) {
    throw new Error("Git state is dirty. Please commit or stash.");
  }

  return runInParallel(ctx, [
    cleanUntracked(git, [".env.local"]),
    deleteEmptyDirs,
  ]);
});
