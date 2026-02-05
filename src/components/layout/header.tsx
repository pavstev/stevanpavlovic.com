"use client";

import { useScroll } from "@client/hooks/use-scroll";
import { initNavigationProgress } from "@client/navigation-progress";
import { cn } from "@client/utils";
import { Logo } from "@components/ui/logo";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@components/ui/navigation-menu";
import { type FC, useEffect } from "react";

import { NAV_ITEMS_ARRAY } from "../../constants";
import { ColorModeToggle } from "../custom/navigation/color-mode-toggle";
import { useCurrentPath, useIsActive } from "../custom/shared/hooks";
import { MobileNav } from "./mobile-nav";

export const Header: FC = () => {
  const scrolled: boolean = useScroll(10);
  const pathname = useCurrentPath();

  useEffect((): void => {
    initNavigationProgress();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-6xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 supports-backdrop-filter:bg-background/50 backdrop-blur-sm md:top-2 md:max-w-6xl md:shadow":
            scrolled,
        }
      )}
    >
      <nav
        className={cn(
          "relative flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          }
        )}
      >
        <div className="flex items-center">
          <a className="hover:bg-muted dark:hover:bg-muted/50 block rounded-md p-2" href="/">
            <Logo />
          </a>
        </div>

        <div className="absolute top-1/2 left-1/2 hidden -translate-1/2 md:flex">
          <NavigationMenu className="px-2" viewport={false}>
            <NavigationMenuList>
              {NAV_ITEMS_ARRAY.map((link) => {
                const isActive = useIsActive(link.href, pathname);

                return (
                  <NavigationMenuItem key={link.label}>
                    <NavigationMenuLink
                      active={isActive}
                      className={navigationMenuTriggerStyle()}
                      href={link.href}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ColorModeToggle />
          </div>
          <MobileNav />
        </div>
      </nav>
      <div
        aria-hidden="true"
        className="bg-primary pointer-events-none fixed top-0 left-0 z-50 h-0.5 w-0 opacity-0 transition-all duration-300 ease-out"
        id="nav-progress"
      />
    </header>
  );
};
