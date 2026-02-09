/**
 * Initializes header scroll effects and progress tracking.
 */
export const initHeaderEffects = (): void => {
  const island = document.getElementById("nav-island");
  const progressBg = document.getElementById("nav-progress-bg");
  const brandWrapper = document.getElementById("brand-wrapper");
  const desktopNav = document.getElementById("desktop-nav");
  const actionsWrapper = document.getElementById("actions-wrapper");

  if (!island) return;

  const handleScroll = (): void => {
    const scroll = window.scrollY;
    const isScrolled = scroll > 50;

    if (isScrolled) {
      // Compact Island
      island.classList.add("h-11", "px-1.5", "scale-95", "border-primary/20", "bg-black/60");
      island.classList.remove("h-14", "px-2");

      if (brandWrapper) brandWrapper.style.opacity = "0.7";
      if (desktopNav) desktopNav.style.gap = "0.25rem";
      if (actionsWrapper) actionsWrapper.style.opacity = "0.8";
    }

    if (!isScrolled) {
      // Default Island
      island.classList.remove("h-11", "px-1.5", "scale-95", "border-primary/20", "bg-black/60");
      island.classList.add("h-14", "px-2");

      if (brandWrapper) brandWrapper.style.opacity = "1";
      if (desktopNav) desktopNav.style.gap = "0.5rem";
      if (actionsWrapper) actionsWrapper.style.opacity = "1";
    }

    // Progress bar logic
    if (progressBg) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBg.style.width = `${scrolled}%`;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
};
