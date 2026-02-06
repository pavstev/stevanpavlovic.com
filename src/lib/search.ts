interface PagefindInstance {
  options: (options: { showImages: boolean }) => void;
  preload: (term: string) => Promise<void>;
  search: (query: string) => Promise<{
    results: PagefindResult[];
  }>;
}

/**
 * Interface for Pagefind search results
 */
interface PagefindResult {
  data: () => Promise<{
    content: string;
    excerpt: string;
    meta: {
      image?: string;
      title: string;
    };
    url: string;
  }>;
  id: string;
}

declare global {
  interface Window {
    pagefind?: PagefindInstance;
  }
}

/**
 * Initializes a single search dropdown instance
 */
const initSingleSearch = (
  container: HTMLElement,
  searchInput: HTMLInputElement,
  clearButton: HTMLElement | null,
  dropdown: HTMLElement,
  resultsContainer: HTMLElement,
): void => {
  let isOpen = false;
  let pagefind: null | PagefindInstance = null;

  const loadPagefind = async (): Promise<void> => {
    if (pagefind) {
      return;
    }
    try {
      // Dynamic import based on environment
      // In dev, we might need to point to a specific location if not served from root
      // Pagefind is generated at build time, so we suppress the TS error for the missing module

      // Use a variable to prevent Vite from trying to resolve this at build time
      const pagefindUrl = "/pagefind/pagefind.js";

      if (import.meta.env.DEV) {
        try {
          pagefind = await import(/* @vite-ignore */ pagefindUrl);
        } catch (e) {
          console.warn("Pagefind not found in dev (expected if not built)", e);
          return;
        }
      }

      if (!import.meta.env.DEV) {
        pagefind = await import(/* @vite-ignore */ pagefindUrl);
      }

      if (pagefind) {
        pagefind.options({ showImages: false });
      }
    } catch (e) {
      console.warn("Pagefind failed to load. Is the site built?", e);
      resultsContainer.innerHTML = `<div class="p-4 text-center text-sm text-muted-foreground">Search is available after build.</div>`;
    }
  };

  const renderResults = async (results: PagefindResult[]): Promise<void> => {
    resultsContainer.innerHTML = "";

    if (results.length === 0) {
      resultsContainer.innerHTML = `<div class="p-4 text-center text-sm text-muted-foreground">No results found.</div>`;
      return;
    }

    const list = document.createElement("ul");
    list.className = "flex flex-col gap-1";

    // Limit to top 5 results for better UX in dropdown
    const topResults = results.slice(0, 5);

    for (const result of topResults) {
      const data = await result.data();
      const item = document.createElement("li");
      item.innerHTML = `
            <a href="${data.url.replace(/\/$/, "")}" class="group flex flex-col gap-1 rounded-xl p-2 transition-colors hover:bg-foreground/5 focus:bg-foreground/5 focus:outline-none">
                <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    ${data.meta.title}
                </span>
                <span class="text-xs text-muted-foreground line-clamp-2">
                    ${data.excerpt}
                </span>
            </a>
        `;
      list.appendChild(item);
    }

    resultsContainer.appendChild(list);

    // Add click listeners to links to close dropdown on navigation
    const links = list.querySelectorAll("a");
    for (const link of links) {
      link.addEventListener("click", () => {
        closeDropdown();
      });
    }
  };

  const performSearch = async (query: string): Promise<void> => {
    if (!query) {
      resultsContainer.innerHTML = "";
      return;
    }

    if (!pagefind) {
      await loadPagefind();
    }

    if (!pagefind) {
      return; // Already showed error in loadPagefind
    }

    resultsContainer.innerHTML = `<div class="p-4 text-center text-sm text-muted-foreground animate-pulse">Searching...</div>`;

    try {
      const search = await pagefind.search(query);
      await renderResults(search.results);
    } catch (e) {
      console.error("Search failed", e);
      resultsContainer.innerHTML = `<div class="p-4 text-center text-sm text-red-500">Search failed.</div>`;
    }
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

    // Trigger search if we have value
    if (searchInput.value.length > 2) {
      void performSearch(searchInput.value);
    }
  };

  // Handle input changes with debounce
  let debounceTimer: ReturnType<typeof setTimeout>;

  searchInput.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;

    // Update clear button visibility
    updateClearButton();

    clearTimeout(debounceTimer);

    // Only search/show dropdown if more than 2 characters
    if (value.length > 2) {
      if (!isOpen) {
        openDropdown();
      }

      debounceTimer = setTimeout(() => {
        void performSearch(value);
      }, 300);
      return;
    }

    if (isOpen) {
      closeDropdown();
    }
    resultsContainer.innerHTML = "";
  });

  // Handle touch events for mobile
  searchInput.addEventListener(
    "touchstart",
    () => {
      if (!isOpen && searchInput.value.length > 2) {
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
      resultsContainer.innerHTML = "";
    });
  }

  // Focus handling - open dropdown on click/focus
  searchInput.addEventListener("focus", () => {
    if (!isOpen && searchInput.value.length > 2) {
      openDropdown();
    }
    // Preload pagefind on focus
    void loadPagefind();
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
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((target as HTMLElement).tagName)) {
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
    const idPrefix = variant === "mobile" ? "mobile-search" : "desktop-search";
    const searchInput = document.getElementById(`${idPrefix}-input`) as HTMLInputElement;
    const clearButton = document.getElementById(`${idPrefix}-clear`);
    const dropdown = document.getElementById(`${idPrefix}-dropdown`);
    const resultsContainer = document.getElementById(`${idPrefix}-results`);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!searchInput || !dropdown || !resultsContainer) {
      continue;
    }

    initSingleSearch(container as HTMLElement, searchInput, clearButton, dropdown, resultsContainer);
  }
};
