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
    newToggle.classList.toggle("open");

    if (!isOpen) {
      menu.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      return;
    }

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
  const sections = document.querySelectorAll("a[data-active]");
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

  for (const section of sections) {
    const href = section.getAttribute("href");
    const cleanHref = href?.replace(/\/$/, "") || "/";

    const isActive = cleanHref === "/"
      ? currentPath === "/"
      : currentPath.startsWith(cleanHref);

    section.setAttribute("data-active", String(isActive));
  }
};
