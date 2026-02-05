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
  const links = document.querySelectorAll("a[data-nav-link]");
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

  const activeClasses = ["bg-white/10", "text-foreground", "shadow-sm"];
  const inactiveClasses = ["text-muted-foreground", "hover:text-foreground", "hover:bg-white/5"];

  for (const link of links) {
    const href = link.getAttribute("href");
    const cleanHref = href?.replace(/\/$/, "") || "/";

    const isActive = cleanHref === "/"
      ? currentPath === "/"
      : currentPath.startsWith(cleanHref);

    const icon = link.querySelector("[data-nav-icon]");

    if (!isActive) {
      link.classList.remove(...activeClasses);
      link.classList.add(...inactiveClasses);
      if (icon) {
        icon.classList.remove("w-3", "opacity-100");
        icon.classList.add("w-0", "opacity-0");
      }
      continue;
    }

    link.classList.add(...activeClasses);
    link.classList.remove(...inactiveClasses);
    if (icon) {
      icon.classList.remove("w-0", "opacity-0");
      icon.classList.add("w-3", "opacity-100");
    }
  }
};
