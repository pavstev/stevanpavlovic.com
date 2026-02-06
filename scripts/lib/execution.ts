import { type ConsolaInstance } from "consola";

import { createLogger } from "./logger.ts";

// knip-ignore
export interface ExecutionContext {
  cwd: string;
  logger: ConsolaInstance;
}

export type ExecutionResult = 0 | 1;

export type ParallelPromise = (ctx: ExecutionContext) => Promise<ExecutionResult>;

type RunSafeCallback = (ctx: ExecutionContext) => ExecutionResult | Promise<ExecutionResult>;

const performRun = async (name: string, fn: RunSafeCallback): Promise<ExecutionResult> => {
  const logger = createLogger(name);

  logger.start(`Starting ${name} script...`);

  try {
    const result = await fn({ cwd: process.cwd(), logger });
    if (result === 0) {
      logger.success(`Completed ${name} script.`);
    }
    return result;
  } catch (err) {
    logger.error(err instanceof Error ? err.message : err);
    return 1;
  }
};

export const runSafe = async (name: string, fn: RunSafeCallback): Promise<void> => {
  const result = await performRun(name, fn);

  if (result !== 0) {
    process.exit(result);
  }
};

export const runInParallel = async (ctx: ExecutionContext, promises: ParallelPromise[]): Promise<ExecutionResult> => {
  const results = await Promise.allSettled(promises.map((p) => p(ctx)));

  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    ctx.logger.error(`One or more scripts failed.`, ...failed.map((result) => result.reason));
    return 1;
  }

  ctx.logger.success("All scripts completed successfully.");
  return 0;
};
