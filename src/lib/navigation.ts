import { PROFILE } from "../config";

/**
 * Checks if a given href is active relative to the current path.
 */
export const isActivePath = (currentPath: string, href: string): boolean => {
  const cleanPath = currentPath.replace(/\/$/, "") || "/";
  const cleanHref = href.replace(/\/$/, "") || "/";

  if (cleanHref === "/") {
    return cleanPath === "/";
  }

  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
};

/**
 * Generates the copyright text for the footer.
 */
export const getCopyrightText = (): string =>
  `© ${String(new Date().getFullYear())} ${PROFILE.name}. All rights reserved.`;

/**
 * Navigation Progress Bar logic
 */
const startProgress = (): void => {
  const bar = document.getElementById("nav-progress");
  if (!bar) return;

  // Reset and show
  bar.style.transition = "none";
  bar.style.width = "0%";
  bar.style.opacity = "1";

  // Force reflow
  bar.getBoundingClientRect();

  // Start trickling (using a long ease to simulate loading)
  bar.style.transition = "width 10s cubic-bezier(0.1, 0.05, 0, 1)";
  bar.style.width = "90%";
};

const endProgress = (): void => {
  const bar = document.getElementById("nav-progress");
  if (!bar) return;

  // Fast finish and fade out
  bar.style.transition = "width 300ms ease-in-out, opacity 300ms 200ms linear";
  bar.style.width = "100%";
  bar.style.opacity = "0";
};

/**
 * Initializes the navigation progress bar observers.
 */
export const initNavigationProgress = (): void => {
  document.addEventListener("astro:before-preparation", startProgress);
  document.addEventListener("astro:after-swap", endProgress);
};
