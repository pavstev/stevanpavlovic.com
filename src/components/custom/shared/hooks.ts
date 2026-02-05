import { useEffect, useState } from "react";

export const useCurrentPath = (): string => {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return pathname;
};

export const useIsActive = (href: string, pathname: string): boolean => {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
};
