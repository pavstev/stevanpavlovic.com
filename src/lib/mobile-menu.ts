export const initMobileMenu = (): void => {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!toggle || !menu) {
    return;
  }

  // Remove old listeners by cloning
  const newToggle = toggle.cloneNode(true) as HTMLElement;
  toggle.parentNode?.replaceChild(newToggle, toggle);

  newToggle.addEventListener("click", () => {
    const isOpen = newToggle.classList.contains("open");

    if (!isOpen) {
      newToggle.classList.add("open");
      menu.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      return;
    }

    newToggle.classList.remove("open");
    menu.setAttribute("data-open", "false");
    document.body.style.overflow = "";
  });

  // Close on link click
  const links = menu.querySelectorAll("a");
  for (const link of links) {
    link.addEventListener("click", () => {
      newToggle.classList.remove("open");
      menu.setAttribute("data-open", "false");
      document.body.style.overflow = "";
    });
  }
};

export const updateActiveLinks = (): void => {
  const links = document.querySelectorAll("[data-nav-link]");
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

  // Standardized classes to match server rendering
  const activeClasses = ["bg-foreground/10", "text-foreground", "ring-2", "ring-offset-foreground/20"];
  const inactiveClasses = ["text-muted-foreground", "hover:bg-foreground/5", "hover:text-foreground"];

  for (const link of links) {
    const href = link.getAttribute("href");
    const cleanHref = href?.replace(/\/$/, "") || "/";

    const isActive =
      cleanHref === "/" ? currentPath === "/" : currentPath === cleanHref || currentPath.startsWith(`${cleanHref}/`);

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
