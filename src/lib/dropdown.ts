/**
 * Initializes dropdown functionality
 */
export const initDropdowns = (): void => {
  const dropdowns = document.querySelectorAll<HTMLElement>("[data-dropdown]");

  for (const dropdown of dropdowns) {
    const id = dropdown.dataset.dropdown;
    if (!id) {
      continue;
    }

    const trigger = dropdown.querySelector<HTMLButtonElement>(`[data-dropdown-trigger="${id}"]`);
    const menu = dropdown.querySelector<HTMLElement>(`[data-dropdown-menu="${id}"]`);
    const icon = dropdown.querySelector<HTMLElement>(".dropdown-icon");

    if (!trigger || !menu) {
      continue;
    }

    let isOpen = false;

    const getItems = (): NodeListOf<HTMLElement> => menu.querySelectorAll<HTMLElement>("[role=\"option\"]");
    const getFirstItem = (): HTMLElement | null => menu.querySelector<HTMLElement>("[role=\"option\"]");
    const getLastItem = (): HTMLElement | null => {
      const items = getItems();
      return items.length > 0 ? items[items.length - 1] : null;
    };

    const closeDropdown = (): void => {
      isOpen = false;
      menu.classList.remove("opacity-100", "visible");
      menu.classList.add("opacity-0", "invisible");
      icon?.classList.remove("rotate-180");
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    };

    const openDropdown = (): void => {
      isOpen = true;
      menu.classList.remove("opacity-0", "invisible");
      menu.classList.add("opacity-100", "visible");
      icon?.classList.add("rotate-180");
      trigger.setAttribute("aria-expanded", "true");
      getFirstItem()?.focus();
    };

    const toggleDropdown = (): void => {
      // Close all other dropdowns
      const allMenus = document.querySelectorAll<HTMLElement>("[data-dropdown-menu]");
      for (const otherMenu of allMenus) {
        if (otherMenu !== menu) {
          otherMenu.classList.remove("opacity-100", "visible");
          otherMenu.classList.add("opacity-0", "invisible");
          const otherIcon = otherMenu.closest("[data-dropdown]")?.querySelector<HTMLElement>(".dropdown-icon");
          otherIcon?.classList.remove("rotate-180");
          const otherTrigger = otherMenu.closest("[data-dropdown]")?.querySelector<HTMLButtonElement>("[data-dropdown-trigger]");
          otherTrigger?.setAttribute("aria-expanded", "false");
        }
      }

      if (isOpen) {
        closeDropdown();
      }
      else {
        openDropdown();
      }
    };

    // Toggle on click
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // Handle button items - close dropdown on click
    const buttonItems = menu.querySelectorAll("button[data-value]");
    for (const item of buttonItems) {
      item.addEventListener("click", () => {
        closeDropdown();
      });
    }

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target as Node)) {
        closeDropdown();
      }
    });

    // Handle escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeDropdown();
      }
    });

    // Trigger keyboard navigation
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) {
          toggleDropdown();
        }
        else {
          getFirstItem()?.focus();
        }
      }
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          toggleDropdown();
        }
        else {
          getLastItem()?.focus();
        }
      }
    });

    // Menu keyboard navigation
    menu.addEventListener("keydown", (e) => {
      const items = getItems();
      const itemsArray = Array.from(items);
      const currentIndex = itemsArray.indexOf(document.activeElement as HTMLElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < itemsArray.length - 1 ? currentIndex + 1 : 0;
        itemsArray[nextIndex]?.focus();
      }
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemsArray.length - 1;
        itemsArray[prevIndex]?.focus();
      }
      else if (e.key === "Home") {
        e.preventDefault();
        getFirstItem()?.focus();
      }
      else if (e.key === "End") {
        e.preventDefault();
        getLastItem()?.focus();
      }
      else if (e.key === "Escape") {
        e.preventDefault();
        closeDropdown();
      }
      else if (e.key === "Tab") {
        // Allow tab to close dropdown normally
        closeDropdown();
      }
    });
  }
};
