import { globby } from "globby";
import { readdir, rmdir } from "node:fs/promises";

import { type ParallelPromise } from "./execution.ts";

export const deleteEmptyDirs: ParallelPromise = async ({ logger }) => {
  logger.info("Deleting empty folders...");

  const dirs = await globby("**", {
    dot: true,
    expandDirectories: false,
    gitignore: true,
    onlyDirectories: true,
  });
  const sorted = dirs.sort((a, b) => b.split("/").length - a.split("/").length);
  let count = 0;
  for (const dir of sorted) {
    try {
      if ((await readdir(dir)).length === 0) {
        logger.debug(`Deleted: ${dir}`);
        await rmdir(dir);
        count++;
      }
    } catch (e) {
      logger.trace(`Error ${dir}:`, e);
    }
  }

  if (count === 0) {
    logger.info("No empty dirs.");
    return 0;
  }

  logger.success(`Deleted ${count.toString()} dirs.`);
  return 0;
};
