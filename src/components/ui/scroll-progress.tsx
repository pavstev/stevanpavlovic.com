import { cn } from "@client";
import { motion, type MotionProps, useScroll } from "motion/react";
import React from "react";

interface ScrollProgressProps extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const ScrollProgress = ({ className, ref, ...props }: ScrollProgressProps) => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-0.5 origin-left",
        "bg-linear-to-r from-primary/40 via-primary to-primary/40",
        "shadow-[0_0_8px_rgba(var(--color-primary),0.5)]",
        className
      )}
      ref={ref}
      style={{
        scaleX: scrollYProgress,
      }}
      {...props}
    />
  );
};
