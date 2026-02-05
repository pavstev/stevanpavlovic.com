"use client";

import { setTheme, themeStore } from "@client/store";
import { cn } from "@client/utils";
import { Button } from "@components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@components/ui/context-menu";
import { Icon } from "@components/ui/icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { useStore } from "@nanostores/react";
import { AnimatePresence, motion } from "framer-motion";
import { type FC, useEffect, useState } from "react";

const THEME_OPTIONS = [
  {
    icon: "mdi:weather-sunny",
    label: "Light",
    value: "light",
  },
  {
    icon: "mdi:weather-night",
    label: "Dark",
    value: "dark",
  },
] as const;

export const ColorModeToggle: FC<{ type?: "dropdown" | "inline" }> = ({ type = "dropdown" }) => {
  const theme = useStore(themeStore);
  const [isMounted, setIsMounted] = useState(false);

  useEffect((): void => {
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

  const MenuContent = (
    <ContextMenuContent>
      {THEME_OPTIONS.map((option) => (
        <ContextMenuItem key={option.value} onClick={() => setTheme(option.value)}>
          <Icon className="mr-2 size-4" name={option.icon} />
          {option.label}
        </ContextMenuItem>
      ))}
    </ContextMenuContent>
  );

  if (type === "inline") {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="inline-flex items-center gap-1 rounded-full p-1" role="radiogroup">
            {THEME_OPTIONS.map((option) => {
              const isActive = theme === option.value;
              return (
                <TooltipProvider key={option.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-checked={isActive}
                        aria-label={`Switch to ${option.label} theme`}
                        className={cn(
                          "relative flex size-8 cursor-pointer items-center justify-center rounded-full transition-all duration-300",
                          isActive
                            ? "text-primary shadow-sm"
                            : "text-muted-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                        )}
                        onClick={() => setTheme(option.value)}
                        role="radio"
                        type="button"
                      >
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              className="bg-foreground/10 absolute inset-0 rounded-full"
                              layoutId="active-theme"
                              transition={{
                                damping: 30,
                                stiffness: 400,
                                type: "spring",
                              }}
                            />
                          )}
                        </AnimatePresence>
                        <Icon
                          className={cn(
                            "relative z-10 size-4.5 transition-all duration-300",
                            isActive ? "scale-110 rotate-0" : "scale-100 opacity-70"
                          )}
                          name={option.icon}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{option.label} mode</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </ContextMenuTrigger>
        {MenuContent}
      </ContextMenu>
    );
  }

  const cycleTheme = (): void => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const ActiveIconName = theme === "dark" ? "mdi:weather-night" : "mdi:weather-sunny";

  return (
    <ContextMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ContextMenuTrigger asChild>
              <Button className="rounded-full" onClick={cycleTheme} size="icon" variant="ghost">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0 }}
                    initial={{ opacity: 0, rotate: -90, scale: 0 }}
                    key={theme}
                    transition={{ duration: 0.15 }}
                  >
                    <Icon className="size-[1.2rem]" name={ActiveIconName} />
                  </motion.div>
                </AnimatePresence>
                <span className="sr-only">Toggle theme</span>
              </Button>
            </ContextMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme (Right click for options)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {MenuContent}
    </ContextMenu>
  );
};
