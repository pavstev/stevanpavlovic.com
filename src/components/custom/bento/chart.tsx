"use client";

import type { FC } from "react";

import { motion } from "framer-motion";

export const ChartAnimation: FC<{ value: number }> = ({ value }) => (
  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
    <motion.div
      animate={{ width: `${value}%` }}
      className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
      initial={{ width: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
  </div>
);
