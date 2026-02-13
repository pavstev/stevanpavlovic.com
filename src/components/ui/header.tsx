"use client";

import { useScroll } from "@client/hooks/use-scroll";
import { cn } from "@client/utils";
import { MobileNav } from "@components/layout/mobile-nav";
import { Logo } from "@components/logo";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@components/ui/navigation-menu";
import { ToggleTheme } from "@components/ui/toggle-theme";
import * as React from "react";

import { NAV_ITEMS_ARRAY } from "../../config";

export const Header = () => {
  const scrolled = useScroll(10);
  const [pathname, setPathname] = React.useState("");

  React.useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-6xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-6xl md:shadow":
            scrolled,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          }
        )}
      >
        <a className="block rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50" href="/">
          <Logo className="h-4" />
        </a>
        <NavigationMenu className="px-2" viewport={false}>
          <NavigationMenuList>
            {NAV_ITEMS_ARRAY.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

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
        <ToggleTheme />
        <MobileNav />
      </nav>
    </header>
  );
};
