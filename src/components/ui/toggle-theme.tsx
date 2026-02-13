"use client";

import { cn } from "@client";
import { AnimatePresence, motion } from "framer-motion";
import { MonitorCogIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

const THEME_OPTIONS = [
  {
    icon: MonitorCogIcon,
    label: "System",
    value: "system",
  },
  {
    icon: SunIcon,
    label: "Light",
    value: "light",
  },
  {
    icon: MoonStarIcon,
    label: "Dark",
    value: "dark",
  },
] as const;

export function ToggleTheme() {
  const { setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  // Use useEffect to ensure we only render the interactive state on the client
  // preventing hydration mismatch with Astro's SSR
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div aria-hidden="true" className="flex h-8 w-[108px]" />;
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full p-1" role="radiogroup">
      {THEME_OPTIONS.map((option) => {
        const isActive = theme === option.value;
        return (
          <button
            aria-checked={isActive}
            aria-label={`Switch to ${option.label} theme`}
            className={cn(
              "relative flex size-8 cursor-pointer items-center justify-center rounded-full transition-all duration-300",
              isActive
                ? "text-primary shadow-sm"
                : "text-muted-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            )}
            key={option.value}
            onClick={() => setTheme(option.value)}
            role="radio"
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-foreground/8"
                  layoutId="active-theme"
                  transition={{
                    damping: 30,
                    stiffness: 400,
                    type: "spring",
                  }}
                />
              )}
            </AnimatePresence>
            <option.icon
              className={cn(
                "relative z-10 size-4.5 transition-all duration-300",
                isActive ? "scale-110 rotate-0" : "scale-100 opacity-70"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
