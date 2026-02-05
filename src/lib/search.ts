/**
 * Initializes a single search dropdown instance
 */
const initSingleSearch = (
  container: HTMLElement,
  searchInput: HTMLInputElement,
  clearButton: HTMLElement | null,
  dropdown: HTMLElement,
): void => {
  let isOpen = false;
  let pagefindInput: HTMLInputElement | null = null;

  // Get the Pagefind input once the dropdown is rendered
  const getPagefindInput = (): HTMLInputElement | null => {
    if (!pagefindInput) {
      pagefindInput = dropdown.querySelector(".pagefind-ui__search-input");
    }
    return pagefindInput;
  };

  const updateClearButton = (): void => {
    if (!clearButton) {
      return;
    }
    if (searchInput.value.length > 0) {
      clearButton.classList.add("visible", "flex");
      clearButton.classList.remove("hidden");
      return;
    }
    clearButton.classList.remove("visible", "flex");
    clearButton.classList.add("hidden");
  };

  const closeDropdown = (): void => {
    isOpen = false;
    dropdown.classList.remove("visible");
    dropdown.classList.add("invisible", "opacity-0");
    searchInput.setAttribute("aria-expanded", "false");
  };

  const openDropdown = (): void => {
    isOpen = true;
    dropdown.classList.add("visible");
    dropdown.classList.remove("invisible", "opacity-0");
    searchInput.setAttribute("aria-expanded", "true");

    // Sync the input value with Pagefind
    const pagefind = getPagefindInput();
    if (pagefind && searchInput.value) {
      pagefind.value = searchInput.value;
      pagefind.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  // Handle input changes
  searchInput.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;

    // Update clear button visibility
    updateClearButton();

    // Sync with Pagefind input
    const pagefind = getPagefindInput();
    if (pagefind) {
      pagefind.value = value;
      pagefind.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Only show dropdown if more than 2 characters
    if (value.length > 2 && !isOpen) {
      openDropdown();
      return;
    }

    if (value.length <= 2 && isOpen) {
      closeDropdown();
    }
  });

  // Handle touch events for mobile
  searchInput.addEventListener(
    "touchstart",
    () => {
      if (!isOpen) {
        openDropdown();
      }
    },
    { passive: true },
  );

  // Clear button click handler
  if (clearButton) {
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      searchInput.value = "";
      updateClearButton();
      closeDropdown();
      searchInput.focus();

      // Clear Pagefind input as well
      const pagefind = getPagefindInput();
      if (pagefind) {
        pagefind.value = "";
        pagefind.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  }

  // Focus handling - open dropdown on click/focus
  searchInput.addEventListener("focus", () => {
    if (!isOpen) {
      openDropdown();
    }
  });

  // Close on outside click/touch
  const closeOnOutside = (e: MouseEvent | TouchEvent): void => {
    const target = e.target as Node;
    if (!container.contains(target)) {
      closeDropdown();
    }
  };

  document.addEventListener("click", closeOnOutside);

  // Handle touch outside to close dropdown on mobile
  document.addEventListener(
    "touchstart",
    (e: TouchEvent) => {
      const target = e.target as Node;
      if (!container.contains(target)) {
        closeDropdown();
      }
    },
    { passive: true },
  );

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      closeDropdown();
      searchInput.blur();
    }
  });

  // Keyboard shortcut: / to focus
  document.addEventListener("keydown", (e) => {
    const target = e.target;
    if (
      e.key === "/"
      && !(target instanceof HTMLInputElement)
      && !(target instanceof HTMLTextAreaElement)
    ) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Keyboard shortcut: Cmd/Ctrl + K to focus
  document.addEventListener("keydown", (e) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      searchInput.focus();
    }
  });
};

/**
 * Initializes all search dropdowns on the page
 */
export const initSearchDropdown = (): void => {
  // Find all search containers and initialize each one
  const containers = document.querySelectorAll(".search-dropdown-container");

  for (const container of containers) {
    const variant = container.getAttribute("data-search-variant") || "desktop";
    const idPrefix
      = variant === "mobile" ? "mobile-search" : "desktop-search";
    const searchInput = document.getElementById(
      `${idPrefix}-input`,
    ) as HTMLInputElement;
    const clearButton = document.getElementById(`${idPrefix}-clear`);
    const dropdown = document.getElementById(`${idPrefix}-dropdown`);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!searchInput || !dropdown) {
      continue;
    }

    initSingleSearch(
      container as HTMLElement,
      searchInput,
      clearButton,
      dropdown,
    );
  }
};
