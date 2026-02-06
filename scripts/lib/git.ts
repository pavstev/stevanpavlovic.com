import { CleanOptions as CO, type SimpleGit } from "simple-git";

import { type ParallelPromise } from "./execution.ts";

export const isGitClean = async (git: SimpleGit): Promise<boolean> => (await git.status()).isClean();

export const cleanUntracked =
  (git: SimpleGit, exclude: string[] = []): ParallelPromise =>
  async ({ logger }) => {
    logger.info("Cleaning untracked...");

    await git.clean(CO.FORCE, [CO.RECURSIVE, CO.IGNORED_INCLUDED, ...exclude.map((e) => `--exclude=${e}`)]);

    logger.success("Untracked cleaned.");
    return 0;
  };
