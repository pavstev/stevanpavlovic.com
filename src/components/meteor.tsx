/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { type FC, useEffect, useState } from "react";

import { cn } from "../lib/cn";

interface MeteorsProps {
  angle?: number;
  className?: string;
  maxDelay?: number;
  maxDuration?: number;
  minDelay?: number;
  minDuration?: number;
  number?: number;
}

export const Meteors: FC<MeteorsProps> = ({
  angle = 215,
  className,
  maxDelay = 1.2,
  maxDuration = 10,
  minDelay = 0.2,
  minDuration = 2,
  number = 20,
}) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    [],
  );

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      "--angle": -angle + "deg",
      "animationDelay": Math.random() * (maxDelay - minDelay) + minDelay + "s",
      "animationDuration":
        Math.floor(Math.random() * (maxDuration - minDuration) + minDuration)
        + "s",
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      "left": `calc(0% + ${Math.floor(Math.random() * window.innerWidth)}px)`,
      "top": "-5%",
    }));
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...meteorStyles].map((style, idx) => (
        // Meteor Head
        <span
          className={cn(
            "pointer-events-none absolute size-0.5 rotate-(--angle) animate-meteor rounded-full bg-zinc-500 shadow-[0_0_0_1px_(--color-foreground)]",
            className,
          )}
          key={idx}
          style={{ ...style }}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-12.5 -translate-y-1/2 bg-linear-to-r from-zinc-500 to-transparent" />
        </span>
      ))}
    </div>
  );
};
