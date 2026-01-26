/**
 * Dropdown component utilities
 * Extracted from filter-bar.astro for reuse
 */

export const initDropdowns = (): void => {
  const dropdowns = document.querySelectorAll<HTMLElement>("[data-dropdown]");

  for (const dropdown of dropdowns) {
    const toggle = dropdown.querySelector<HTMLElement>("[data-trigger]");
    const menu = dropdown.querySelector<HTMLElement>("[data-menu]");
    const chevron = dropdown.querySelector<HTMLElement>("[data-chevron]");

    if (!toggle || !menu || !chevron) {
      continue;
    }

    // Skip if already initialized
    if (dropdown.hasAttribute("data-dropdown-init")) {
      continue;
    }

    let isOpen = false;

    const openMenu = (): void => {
      isOpen = true;
      menu.classList.remove("hidden");
      requestAnimationFrame(() => {
        menu.classList.remove("opacity-0", "scale-95");
        menu.classList.add("opacity-100", "scale-100");
        chevron.classList.add("rotate-180");
        toggle.setAttribute("aria-expanded", "true");
        dropdown.style.zIndex = "60";
      });
    };

    const closeMenu = (): void => {
      isOpen = false;
      menu.classList.remove("opacity-100", "scale-100");
      menu.classList.add("opacity-0", "scale-95");
      chevron.classList.remove("rotate-180");
      toggle.setAttribute("aria-expanded", "false");
      setTimeout(() => {
        if (!isOpen) {
          menu.classList.add("hidden");
          dropdown.style.zIndex = "";
        }
      }, 200);
    };

    const closeAllOtherDropdowns = (): void => {
      const allDropdowns = document.querySelectorAll("[data-dropdown]");
      for (const d of allDropdowns) {
        if (d !== dropdown) {
          const otherMenu = d.querySelector("[data-menu]");
          const otherChevron = d.querySelector("[data-chevron]");
          const otherToggle = d.querySelector("[data-trigger]");

          if (otherMenu && !otherMenu.classList.contains("hidden")) {
            otherMenu.classList.add("hidden", "opacity-0", "scale-95");
            otherMenu.classList.remove("opacity-100", "scale-100");
            otherChevron?.classList.remove("rotate-180");
            otherToggle?.setAttribute("aria-expanded", "false");
            (d as HTMLElement).style.zIndex = "";
          }
        }
      }
    };

    const toggleMenu = (e: Event): void => {
      e.stopPropagation();
      if (isOpen) {
        closeMenu();
        return;
      }
      closeAllOtherDropdowns();
      openMenu();
    };

    toggle.addEventListener("click", toggleMenu);

    const clickOutside = (e: Event): void => {
      if (!dropdown.isConnected) {
        return;
      }
      if (isOpen && !dropdown.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("click", clickOutside);
    dropdown.setAttribute("data-dropdown-init", "true");
  }
};
