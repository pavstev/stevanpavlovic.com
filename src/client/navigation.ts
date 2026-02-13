import { PROFILE } from "../config";

const isActivePath = (currentPath: string, href: string): boolean => {
  const cleanPath = currentPath.replace(/\/$/, "") ?? "/";
  const cleanHref = href.replace(/\/$/, "") ?? "/";

  if (cleanHref === "/") {
    return cleanPath === "/";
  }

  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
};

export const getCopyrightText = (): string =>
  `© ${String(new Date().getFullYear())} ${PROFILE.name}. All rights reserved.`;
