import { cn } from "@client/utils";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import React, { useCallback, useEffect } from "react";

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientColor?: string;
  gradientFrom?: string;
  gradientOpacity?: number;
  gradientSize?: number;
  gradientTo?: string;
}

export const MagicCard = ({
  children,
  className,
  gradientColor = "#262626",
  gradientFrom = "#9E7AFF",
  gradientOpacity = 0.8,
  gradientSize = 200,
  gradientTo = "#FE8BBB",
}: MagicCardProps): React.JSX.Element => {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect((): void => {
    reset();
  }, [reset]);

  useEffect((): void => {
    const handleGlobalPointerOut = (e: PointerEvent): void => {
      if (!e.relatedTarget) {
        reset();
      }
    };

    const handleVisibility = (): void => {
      if (document.visibilityState !== "visible") {
        reset();
      }
    };

    window.addEventListener("pointerout", handleGlobalPointerOut);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", handleVisibility);

    return (): void => {
      window.removeEventListener("pointerout", handleGlobalPointerOut);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reset]);

  return (
    <div
      className={cn("group relative rounded-[inherit]", className)}
      onPointerEnter={reset}
      onPointerLeave={reset}
      onPointerMove={handlePointerMove}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-border duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
          ${gradientFrom},
          ${gradientTo},
          var(--border) 100%
          )
          `,
        }}
      />
      <div className="absolute inset-px rounded-[inherit] bg-background" />
      <motion.div
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
          `,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};
