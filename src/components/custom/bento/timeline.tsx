"use client";

import type { FC } from "react";

import { motion } from "framer-motion";

import { fadeInLeft } from "../shared/animations";

export const TimelineFeature: FC<{ timeline: Array<{ event: string; year: string }> }> = ({
  timeline,
}) => (
  <div className="relative mt-3">
    <div className="absolute top-0 bottom-0 left-[9px] w-[2px] bg-neutral-200 dark:bg-neutral-700" />
    {timeline.map((item, index) => (
      <motion.div
        animate="visible"
        className="relative mb-3 flex gap-3"
        initial="hidden"
        key={`timeline-${index}`}
        transition={{
          delay: 0.15 * index,
        }}
        variants={fadeInLeft}
      >
        <div className="z-10 mt-0.5 size-5 shrink-0 rounded-full border-2 border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800" />
        <div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {item.year}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">{item.event}</div>
        </div>
      </motion.div>
    ))}
  </div>
);
