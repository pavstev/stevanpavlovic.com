"use client";

import type { FC } from "react";

import { cn } from "@client/utils";
import { motion, type Variants } from "framer-motion";

import type { BentoItem } from "./bento-types";

import { fadeInUp } from "../shared/animations";
import { BentoCard } from "./bento-card";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.15,
    },
  },
};

export const BentoGrid: FC<{
  className?: string;
  items: BentoItem[];
}> = ({ className, items }) => (
  <section className={cn("relative overflow-hidden bg-transparent py-24 sm:py-32", className)}>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        className="grid gap-8 md:grid-cols-3"
        initial="hidden"
        variants={staggerContainer}
        whileInView="visible"
      >
        {items.map((item) => (
          <motion.div
            className={cn("md:col-span-1", item.className)}
            key={item.id}
            variants={fadeInUp}
          >
            <BentoCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);