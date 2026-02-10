import { PROFILE } from "../config";

export const isActivePath = (currentPath: string, href: string): boolean => {
  const cleanPath = currentPath.replace(/\/$/, "") || "/";
  const cleanHref = href.replace(/\/$/, "") || "/";

  if (cleanHref === "/") {
    return cleanPath === "/";
  }

  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
};

export const getCopyrightText = (): string =>
  `© ${String(new Date().getFullYear())} ${PROFILE.name}. All rights reserved.`;

const startProgress = (): void => {
  const bar = document.getElementById("nav-progress");
  if (!bar) return;

  bar.style.transition = "none";
  bar.style.width = "0%";
  bar.style.opacity = "1";

  bar.getBoundingClientRect();

  bar.style.transition = "width 10s cubic-bezier(0.1, 0.05, 0, 1)";
  bar.style.width = "90%";
};

const endProgress = (): void => {
  const bar = document.getElementById("nav-progress");
  if (!bar) return;

  bar.style.transition = "width 300ms ease-in-out, opacity 300ms 200ms linear";
  bar.style.width = "100%";
  bar.style.opacity = "0";
};

export const initNavigationProgress = (): void => {
  document.addEventListener("astro:before-preparation", startProgress);
  document.addEventListener("astro:after-swap", endProgress);
};
