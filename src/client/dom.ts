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

type InitHeaderEffectsProps = {
  afterScrollClasses: {
    add: string[];
    remove: string[];
  };
};

export const initHeaderEffects = ({ afterScrollClasses }: InitHeaderEffectsProps): void => {
  const island = document.getElementById("nav-island");
  if (!island) return;

  const handleScroll = (): void => {
    const scroll = window.scrollY;
    const isScrolled = scroll > 50;

    if (isScrolled) {
      island.classList.add(...afterScrollClasses.add);
      island.classList.remove(...afterScrollClasses.remove);
    }

    if (!isScrolled) {
      island.classList.remove(...afterScrollClasses.add);
      island.classList.add(...afterScrollClasses.remove);
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
};
