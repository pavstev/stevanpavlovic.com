"use client";

import type { FC } from "react";

import { cn } from "@client/utils.ts";
import { motion } from "framer-motion";

const getColorClass = (color = "emerald"): string => {
  const colors: Record<string, string> = {
    amber: "bg-amber-500 dark:bg-amber-400",
    blue: "bg-blue-500 dark:bg-blue-400",
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    rose: "bg-rose-500 dark:bg-rose-400",
    violet: "bg-violet-500 dark:bg-violet-400",
  };
  return colors[color] || colors.emerald;
};

import { fadeInUpSubtle } from "../shared/animations.ts";

export const MetricsFeature: FC<{
  metrics: Array<{
    color?: string;
    label: string;
    suffix?: string;
    value: number;
  }>;
}> = ({ metrics }) => (
  <div className="mt-3 space-y-3">
    {metrics.map((metric, index) => (
      <motion.div
        animate="visible"
        className="space-y-1"
        initial="hidden"
        key={`metric-${index}`}
        transition={{ delay: 0.15 * index }}
        variants={fadeInUpSubtle}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
            {metric.color && (
              <div
                className={cn(
                  "size-2.5 rounded-full",
                  metric.color === "amber" && "bg-amber-500",
                  metric.color === "blue" && "bg-blue-500",
                  metric.color === "emerald" && "bg-emerald-500",
                  metric.color === "rose" && "bg-rose-500",
                  metric.color === "violet" && "bg-violet-500"
                )}
              />
            )}
            {metric.label}
          </div>
          <div className="font-semibold text-neutral-700 dark:text-neutral-300">
            {metric.value}
            {metric.suffix}
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <motion.div
            animate={{
              width: `${Math.min(100, metric.value * 10)}%`,
            }}
            className={`h-full rounded-full ${getColorClass(metric.color)}`}
            initial={{ width: 0 }}
            transition={{
              delay: 0.15 * index,
              duration: 1.2,
              ease: "easeOut",
            }}
          />
        </div>
      </motion.div>
    ))}
  </div>
);