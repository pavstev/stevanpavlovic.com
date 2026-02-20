"use client";

import type { FC } from "react";

import { Icon } from "@components/ui/icon";
import { motion } from "framer-motion";

import { fadeInLeft } from "../shared/animations";

export const SpotlightFeature: FC<{ icon?: string; items: string[] }> = ({
  icon = "mdi:check-circle",
  items,
}) => (
  <ul className="mt-2 space-y-1.5">
    {items.map((item, index) => (
      <motion.li
        animate="visible"
        className="flex items-center gap-2"
        initial="hidden"
        key={`spotlight-${index}`}
        transition={{ delay: 0.1 * index }}
        variants={fadeInLeft}
      >
        <Icon className="size-4 shrink-0 text-emerald-500 dark:text-emerald-400" name={icon} />
        <span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
      </motion.li>
    ))}
  </ul>
);