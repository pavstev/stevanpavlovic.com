"use client";

import type { FC } from "react";

import { Icon } from "@components/ui/icon";
import { motion } from "framer-motion";

export const IconsFeature: FC<{ icons: string[] }> = ({ icons }) => (
  <div className="mt-4 grid grid-cols-3 gap-4">
    {icons.map((icon, index) => (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex aspect-square items-center justify-center rounded-lg bg-neutral-100/50 p-3 backdrop-blur-sm dark:bg-neutral-800/50"
        initial={{ opacity: 0, scale: 0.5 }}
        key={`icon-${index}`}
        transition={{ delay: 0.1 * index }}
      >
        <Icon className="size-full text-neutral-600 dark:text-neutral-400" name={icon} />
      </motion.div>
    ))}
  </div>
);
