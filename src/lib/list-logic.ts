/**
 * Functional list logic for client-side filtering, sorting, and pagination.
 */

export interface ListOptions {
  containerId: string; // The parent container for all items
  initialPageSize?: number;
  onUpdate?: (visibleCount: number) => void;
  selectors?: {
    item: string; // Selector for individual items
    noResults?: string;
    paginationNav?: string; // Selector for the pagination nav element
  };
}
export interface ListState {
  filter: null | string;
  limit: number;
  page: number;
  sort: string;
  view: ViewMode;
}

export type SortDirection = "asc" | "desc";

export type ViewMode = "grid" | "list";

/**
 * Initializes the list logic.
 * Binds event listeners to controls and performs the initial render.
 */
export function initList(options: ListOptions) {
  const container = document.getElementById(options.containerId);
  if (!container) {
    console.warn(`[ListLogic] Container #${options.containerId} not found.`);
    return;
  }

  const defaultSelectors = {
    item: ".list-item",
    noResults: "#no-results",
    paginationNav: "nav[aria-label=\"Pagination\"]",
  };

  const config = {
    ...options,
    selectors: { ...defaultSelectors, ...options.selectors },
  };

  // Get initial state from URL
  const state = getUrlState(options.initialPageSize);

  // Initial Process
  processItems(container, state, config);

  // Setup History / URL handling
  // We listen to popstate to handle back/forward buttons
  window.addEventListener("popstate", () => {
    const newState = getUrlState(options.initialPageSize);
    processItems(container, newState, config);
  });
}

function filterItems(items: HTMLElement[], filterParam: null | string): HTMLElement[] {
  if (!filterParam) { return items; }

  return items.filter((item) => {
    const tags = (item.dataset.tags || "").split(",");
    return tags.includes(filterParam);
  });
}

/**
 * Reads the current state from URL search params.
 */
function getUrlState(defaultLimit = 6): ListState {
  const params = new URLSearchParams(window.location.search);
  return {
    filter: params.get("filter"),
    limit: parseInt(params.get("limit") || String(defaultLimit), 10),
    page: parseInt(params.get("page") || "1", 10),
    sort: params.get("sort") || "newest",
    view: (params.get("view") as ViewMode) || "list", // Default to list if not specified, or whatever the page default is logic-wise
  };
}

/**
 * Core processing function: Sorts, Filters, and Paginates items in the DOM.
 */
function processItems(container: HTMLElement, state: ListState, config: ListOptions) {
  if (!config.selectors?.item) { return; }

  const allItems = Array.from(container.querySelectorAll<HTMLElement>(config.selectors.item));
  const noResultsEl = config.selectors.noResults ? document.querySelector(config.selectors.noResults) : null;
  const paginationNav = config.selectors.paginationNav ? document.querySelector(config.selectors.paginationNav) : null;

  // 1. Sort
  const sortedItems = sortItems(allItems, state.sort);

  // 2. Filter
  const filteredItems = filterItems(sortedItems, state.filter);

  // 3. Paginate
  const startIndex = (state.page - 1) * state.limit;
  const endIndex = startIndex + state.limit;


  // 4. Update DOM visibility & Order
  // We appendChild to reorder them visually if needed, although simple show/hide might suffice depending on CSS grid/flex
  // For masonry or ordered grids, re-appending is safer for order.

  // Create a fragment to minimize reflows for reordering?
  // Actually, just toggling hidden and ensuring order is enough.
  // We must re-append to ensure visual order matches sorted order.

  // Note: If we have multiple view containers (grid vs list), we need to handle both
  // But usually, the "item" selector selects BOTH grid and list items if they are duplicated in DOM.
  // Or we expect the container to contain ONLY the currently active view's items?
  // The current implementation in ClientList handled distinct listView and gridView containers.
  // Let's adapt: The containerId usually wraps both.

  // Optimized Approach: Iterate through sorted+filtered list first
  const handledItems = new Set<HTMLElement>();

  // First, handle visible items in order
  filteredItems.slice(startIndex, endIndex).forEach((item) => {
    item.classList.remove("hidden");
    // For Masonry or Flex order to work with sorting, we might need to append.
    // However, if we are just hiding/showing, order might depend on original DOM order unless we re-append.
    container.appendChild(item); // Moves it to the end (visually reordering)
    handledItems.add(item);
  });

  // Then hide everything else
  allItems.forEach((item) => {
    if (!handledItems.has(item)) {
      item.classList.add("hidden");
    }
  });

  // 5. Update UI Controls
  updatePaginationUI(paginationNav, state, filteredItems.length);
  updateNoResultsUI(noResultsEl, filteredItems.length);
  updateViewToggleState(state.view);

  if (config.onUpdate) {
    config.onUpdate(filteredItems.length);
  }
}

function sortItems(items: HTMLElement[], sortParam: string): HTMLElement[] {
  return items.sort((a, b) => {
    const titleA = a.dataset.title || "";
    const titleB = b.dataset.title || "";
    const dateA = parseInt(a.dataset.date || "0", 10);
    const dateB = parseInt(b.dataset.date || "0", 10);

    switch (sortParam) {
    case "a-z": return titleA.localeCompare(titleB);
    case "oldest": return dateA - dateB;
    case "newest":
    default: return dateB - dateA;
    }
  });
}

/**
 * Updates a link's HREF to match current params + overrides
 */
function updateLinkHref(link: HTMLAnchorElement | HTMLElement, overrides: Record<string, number | string>) {
  // This is purely visual/semantic since we handle state via URL parsing,
  // but good for "Open in new tab"
  if (!(link instanceof HTMLAnchorElement)) { return; }

  const url = new URL(window.location.href);
  Object.entries(overrides).forEach(([k, v]) => {
    url.searchParams.set(k, String(v));
  });
  link.href = url.toString();
}

function updateNoResultsUI(el: Element | null, count: number) {
  if (!el) { return; }
  if (count === 0) { el.classList.remove("hidden"); }
  else { el.classList.add("hidden"); }
}

function updatePaginationUI(nav: Element | null, state: ListState, totalCount: number) {
  if (!nav) { return; }

  const totalPages = Math.ceil(totalCount / state.limit);

  if (totalPages <= 1) {
    nav.classList.add("hidden");
    return;
  }

  nav.classList.remove("hidden");

  const currentEl = nav.querySelector<HTMLElement>(".text-foreground");
  const totalEl = nav.querySelector<HTMLElement>(".text-muted-foreground.tabular-nums");
  const prevBtn = nav.querySelector<HTMLElement>("a[href*=\"page\"]:first-child");
  const nextBtn = nav.querySelector<HTMLElement>("a[href*=\"page\"]:last-child");

  if (currentEl) { currentEl.textContent = String(state.page); }
  if (totalEl) { totalEl.textContent = String(totalPages); }

  if (prevBtn) {
    const disabled = state.page <= 1;
    prevBtn.style.pointerEvents = disabled ? "none" : "auto";
    prevBtn.style.opacity = disabled ? "0.5" : "1";
    // Update href for semantic value
    if (!disabled) { updateLinkHref(prevBtn, { page: state.page - 1 }); }
  }

  if (nextBtn) {
    const disabled = state.page >= totalPages;
    nextBtn.style.pointerEvents = disabled ? "none" : "auto";
    nextBtn.style.opacity = disabled ? "0.5" : "1";
    if (!disabled) { updateLinkHref(nextBtn, { page: state.page + 1 }); }
  }
}

function updateViewToggleState(currentView: ViewMode) {
  // Find view toggles and update active state
  // We assume they are links with ?view=...
  const toggles = document.querySelectorAll<HTMLAnchorElement>("[href*=\"view=\"]");
  toggles.forEach((toggle) => {
    const url = new URL(toggle.href, window.location.origin);
    const view = url.searchParams.get("view");

    const isActive = view === currentView;

    if (isActive) {
      toggle.classList.add("bg-accent", "text-accent-foreground", "shadow-sm");
      toggle.classList.remove("text-muted-foreground", "hover:bg-muted", "hover:text-foreground");
      toggle.setAttribute("aria-pressed", "true");
    }
    else {
      toggle.classList.remove("bg-accent", "text-accent-foreground", "shadow-sm");
      toggle.classList.add("text-muted-foreground", "hover:bg-muted", "hover:text-foreground");
      toggle.setAttribute("aria-pressed", "false");
    }
  });

  // Also toggle the actual containers if they are separate (Grid vs List)
  // Common pattern: .list-view and .grid-view classes
  const listViews = document.querySelectorAll(".list-view");
  const gridViews = document.querySelectorAll(".grid-view");

  if (currentView === "list") {
    listViews.forEach((el) => { el.classList.remove("hidden"); });
    gridViews.forEach((el) => { el.classList.add("hidden"); });
  }
  else {
    listViews.forEach((el) => { el.classList.add("hidden"); });
    gridViews.forEach((el) => { el.classList.remove("hidden"); });
  }
}
