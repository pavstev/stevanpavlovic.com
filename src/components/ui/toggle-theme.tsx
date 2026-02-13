"use client";

import { setTheme, themeStore } from "@client/store";
import { cn } from "@client/utils";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "framer-motion";
import { MonitorCogIcon, MoonStarIcon, SunIcon } from "lucide-react";
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

export const ToggleTheme = ({ type = "dropdown" }: { type?: "dropdown" | "inline" }) => {
  const theme = useStore(themeStore);
  const [isMounted, setIsMounted] = React.useState(false);

  // Use useEffect to ensure we only render the interactive state on the client
  // preventing hydration mismatch with Astro's SSR
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "flex h-9 items-center justify-center",
          type === "inline" ? "w-[108px]" : "w-9"
        )}
      />
    );
  }

  if (type === "inline") {
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
              type="button"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-foreground/10"
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

  const ActiveIcon = THEME_OPTIONS.find((t) => t.value === theme)?.icon || SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full" size="icon" variant="ghost">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0 }}
              initial={{ opacity: 0, rotate: -90, scale: 0 }}
              key={theme}
              transition={{ duration: 0.15 }}
            >
              <ActiveIcon className="size-[1.2rem]" />
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
            <option.icon className="mr-2 size-4" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
