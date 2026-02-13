export const initFocusMode = (): void => {
  const focusBtn = document.getElementById("toggle-focus");
  if (!focusBtn) return;

  const toggleFocus = (): void => {
    document.documentElement.classList.toggle("focus-mode");
  };

  focusBtn.addEventListener("click", toggleFocus);

  const handleKeydown = (e: KeyboardEvent): void => {
    if (
      e.key.toLowerCase() === "f" &&
      !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
    ) {
      toggleFocus();
    }
  };

  window.addEventListener("keydown", handleKeydown);
};

export const updateActiveLinks = (): void => {
  const links = document.querySelectorAll("[data-nav-link]");
  const currentPath = window.location.pathname.replace(/\/$/, "") ?? "/";

  const activeClasses = [
    "bg-foreground/10",
    "text-foreground",
    "ring-2",
    "ring-offset-foreground/20",
  ];
  const inactiveClasses = [
    "text-muted-foreground",
    "hover:bg-foreground/5",
    "hover:text-foreground",
  ];

  for (const link of links) {
    const href = link.getAttribute("href");
    const cleanHref = href?.replace(/\/$/, "") ?? "/";

    const isActive =
      cleanHref === "/"
        ? currentPath === "/"
        : currentPath === cleanHref || currentPath.startsWith(`${cleanHref}/`);

    const dot = link.querySelector(".rounded-full.bg-primary");

    if (isActive) {
      link.classList.add(...activeClasses);
      link.classList.remove(...inactiveClasses);
      link.setAttribute("aria-current", "page");

      if (dot) {
        dot.classList.remove("scale-0", "opacity-0");
      }

      continue;
    }

    link.classList.remove(...activeClasses);
    link.classList.add(...inactiveClasses);
    link.removeAttribute("aria-current");

    if (dot) {
      dot.classList.add("scale-0", "opacity-0");
    }
  }
};

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
      island.classList.add("h-11", "px-1.5", "scale-95", "border-primary/20", "bg-background/60");
      island.classList.remove("h-14", "px-2");

      if (brandWrapper) brandWrapper.style.opacity = "0.7";
      if (desktopNav) desktopNav.style.gap = "0.25rem";
      if (actionsWrapper) actionsWrapper.style.opacity = "0.8";
    }

    if (!isScrolled) {
      island.classList.remove(
        "h-11",
        "px-1.5",
        "scale-95",
        "border-primary/20",
        "bg-background/60"
      );
      island.classList.add("h-14", "px-2");

      if (brandWrapper) brandWrapper.style.opacity = "1";
      if (desktopNav) desktopNav.style.gap = "0.5rem";
      if (actionsWrapper) actionsWrapper.style.opacity = "1";
    }

    if (progressBg) {
      const winScroll = document.body.scrollTop ?? document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBg.style.width = `${scrolled}%`;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
};
