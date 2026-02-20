import { cn } from "@client/utils";
import { type ComponentPropsWithoutRef, type CSSProperties, memo } from "react";

interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainCircleOpacity?: number;
  mainCircleSize?: number;
  numCircles?: number;
}

export const Ripple = memo(
  ({
    className,
    mainCircleOpacity = 0.24,
    mainCircleSize = 210,
    numCircles = 8,
    ...props
  }: RippleProps) => (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 mask-[linear-gradient(to_bottom,white,transparent)] select-none",
        className
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = "solid";

        return (
          <div
            className={`animate-ripple bg-foreground/25 absolute rounded-full border shadow-xl`}
            key={i}
            style={
              {
                "--i": i,
                animationDelay,
                borderColor: `var(--foreground)`,
                borderStyle,
                borderWidth: "1px",
                height: `${size}px`,
                left: "50%",
                opacity,
                top: "50%",
                transform: "translate(-50%, -50%) scale(1)",
                width: `${size}px`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  )
);

Ripple.displayName = "Ripple";