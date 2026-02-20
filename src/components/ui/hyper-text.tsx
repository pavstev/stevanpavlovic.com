import { cn } from "@client/utils.ts";
import { AnimatePresence, motion, type MotionProps } from "motion/react";
import { type ElementType, type FC, type ReactNode, useEffect, useRef, useState } from "react";

type CharacterSet = readonly string[] | string[];

interface HyperTextProps extends MotionProps {
  animateOnHover?: boolean;

  as?: ElementType;

  characterSet?: CharacterSet;

  children?: ReactNode;

  className?: string;

  delay?: number;

  duration?: number;

  startOnView?: boolean;

  text?: string;
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

export const HyperText: FC<HyperTextProps> = ({
  animateOnHover = true,
  as: Component = "div",
  characterSet = DEFAULT_CHARACTER_SET,
  children,
  className,
  delay = 0,
  duration = 800,
  startOnView = false,
  text: textProp,
  ...props
}) => {
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const getTextContent = (content: ReactNode): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.map((c) => getTextContent(c)).join("");
    if (content === null || content === undefined) return "";
    return String(content);
  };

  const text = textProp || getTextContent(children).trim();

  const [displayText, setDisplayText] = useState<string[]>(() => text.split(""));
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationCount = useRef(0);
  const elementRef = useRef<HTMLElement>(null);

  const handleAnimationTrigger = (): void => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  useEffect((): VoidFunction => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsAnimating(true);
          }, delay);
          observer.disconnect();
        }
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  useEffect((): void | VoidFunction => {
    if (!isAnimating) return;

    const maxIterations = text.length;
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      iterationCount.current = progress * maxIterations;

      setDisplayText((currentText) =>
        currentText.map((letter, index) =>
          letter === " "
            ? letter
            : index <= iterationCount.current
              ? text[index]
              : characterSet[getRandomInt(characterSet.length)]
        )
      );

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [text, duration, isAnimating, characterSet]);

  return (
    <MotionComponent
      className={cn("overflow-hidden py-2 text-4xl font-bold", className)}
      onMouseEnter={handleAnimationTrigger}
      ref={elementRef}
      {...props}
    >
      <AnimatePresence>
        {displayText.map((letter, index) => (
          <motion.span className={cn("font-mono", letter === " " ? "w-3" : "")} key={index}>
            {letter.toUpperCase()}
          </motion.span>
        ))}
      </AnimatePresence>
    </MotionComponent>
  );
};