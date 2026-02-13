"use client";
import { useScroll } from "@client/hooks/use-scroll";
import { cn } from "@client/utils";
import { MobileNav } from "@components/layout/mobile-nav";
import { Logo } from "@components/logo";
import { Button } from "@components/ui/button";
import { ToggleTheme } from "@components/ui/toggle-theme";

import { NAV_ITEMS_ARRAY } from "../../config";

export const Header = () => {
  const scrolled = useScroll(10);

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
        <a className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50" href="/">
          <Logo className="h-4" />
        </a>
        <div className="hidden items-center gap-2 md:flex">
          <div>
            {NAV_ITEMS_ARRAY.map((link) => (
              <Button asChild key={link.label} size="sm" variant="ghost">
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>
          <ToggleTheme />
        </div>
        <MobileNav />
      </nav>
    </header>
  );
};
