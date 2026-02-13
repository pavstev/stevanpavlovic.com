"use client";

import { cn } from "@client/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export const GlowingStarsBackgroundCard: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }): React.JSX.Element => {
  const [mouseEnter, setMouseEnter]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] =
    useState<boolean>(false);

  return (
    <div
      className={cn(
        "relative flex size-full  flex-col overflow-hidden rounded-xl border border-neutral-200/50 bg-[linear-gradient(110deg,#333_0.6%,#222)] p-4 dark:border-neutral-800",
        className
      )}
      onMouseEnter={(): void => setMouseEnter(true)}
      onMouseLeave={(): void => setMouseEnter(false)}
    >
      <Illustration className="absolute inset-0 size-full " mouseEnter={mouseEnter} />
      <div className="relative z-20 flex h-full flex-col">{children}</div>
    </div>
  );
};

export const GlowingStarsDescription: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }): React.JSX.Element => {
  return <p className={cn("max-w-3xs text-base text-white/70", className)}>{children}</p>;
};

export const GlowingStarsTitle: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }): React.JSX.Element => {
  return <h2 className={cn("text-2xl font-bold text-white", className)}>{children}</h2>;
};

export const Illustration: React.FC<{
  className?: string;
  columns?: number;
  mouseEnter: boolean;
  stars?: number;
}> = ({ className, columns = 18, mouseEnter, stars = 108 }): React.JSX.Element => {
  const [glowingStars, setGlowingStars]: [
    number[],
    React.Dispatch<React.SetStateAction<number[]>>,
  ] = useState<number[]>([]);
  const highlightedStars: React.MutableRefObject<number[]> = useRef<number[]>([]);

  useEffect((): (() => void) => {
    const interval: NodeJS.Timeout = setInterval((): void => {
      highlightedStars.current = Array.from({ length: 5 }, (): number =>
        Math.floor(Math.random() * (stars || 108))
      );
      setGlowingStars([...highlightedStars.current]);
    }, 3000);

    return (): void => clearInterval(interval);
  }, [stars]);

  return (
    <div
      className={cn("pointer-events-none w-full p-1", className)}
      style={{
        display: "grid",
        gap: `1px`,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {[...Array(stars)].map((_, starIdx: number): React.JSX.Element => {
        const isGlowing: boolean = glowingStars.includes(starIdx);
        const delay: number = (starIdx % 10) * 0.1;
        const staticDelay: number = starIdx * 0.01;
        return (
          <div className="relative flex items-center justify-center" key={`matrix-col-${starIdx}`}>
            <Star
              delay={mouseEnter ? staticDelay : delay}
              isGlowing={mouseEnter ? true : isGlowing}
            />
            {mouseEnter && <Glow delay={staticDelay} />}
            <AnimatePresence mode="wait">{isGlowing && <Glow delay={delay} />}</AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

const Star: React.FC<{ delay: number; isGlowing: boolean }> = ({
  delay,
  isGlowing,
}): React.JSX.Element => {
  return (
    <motion.div
      animate={{
        background: isGlowing ? "#fff" : "#666",
        scale: isGlowing ? [1, 1.2, 2.5, 2.2, 1.5] : 1,
      }}
      className={cn("relative z-20 size-px rounded-full bg-[#666]")}
      initial={{
        scale: 1,
      }}
      transition={{
        delay: delay,
        duration: 2,
        ease: "easeInOut",
      }}
    />
  );
};

const Glow: React.FC<{ delay: number }> = ({ delay }): React.JSX.Element => {
  return (
    <motion.div
      animate={{
        opacity: 1,
      }}
      className="absolute left-1/2 z-10 size-[4px] -translate-x-1/2 rounded-full bg-blue-500 shadow-2xl shadow-blue-400 blur-[1px]"
      exit={{
        opacity: 0,
      }}
      initial={{
        opacity: 0,
      }}
      transition={{
        delay: delay,
        duration: 2,
        ease: "easeInOut",
      }}
    />
  );
};
