"use client";

import type { FC } from "react";

import { useEffect, useState } from "react";

export const CounterAnimation: FC<{ end: number; start: number; suffix?: string }> = ({
  end,
  start,
  suffix = "",
}) => {
  const [count, setCount] = useState(start);

  useEffect((): void | VoidFunction => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 2000;

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easedProgress;

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [start, end]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        {Math.floor(count)}
      </span>
      <span className="text-xl font-medium text-neutral-900 dark:text-neutral-100">{suffix}</span>
    </div>
  );
};
