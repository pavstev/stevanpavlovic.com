export interface ClientListOptions {
  containerId: string;
  initialPageSize?: number;
  onUpdate?: (totalVisible: number) => void;
  ui?: {
    gridViewSelector?: string;
    itemSelector?: string;
    listViewSelector?: string;
    noResultsSelector?: string;
    paginationSelector?: string;
  };
}

export interface ListState {
  filter: null | string;
  limit: number;
  page: number;
  sort: string;
  view: ViewMode;
}

export type ViewMode = "grid" | "list";

export class ClientList {
  private container: HTMLElement | null = null;
  private gridView: HTMLElement | null = null;
  private listView: HTMLElement | null = null;
  private noResults: HTMLElement | null = null;
  private options: ClientListOptions;
  private paginationNav: HTMLElement | null = null;
  private state: ListState;

  constructor(options: ClientListOptions) {
    const params = new URLSearchParams(window.location.search);
    this.options = {
      initialPageSize: 6,
      ...options,
      ui: {
        gridViewSelector: ".grid-view",
        itemSelector: ".list-item",
        listViewSelector: ".list-view",
        noResultsSelector: "#no-results",
        paginationSelector: "nav[aria-label=\"Pagination\"]",
        ...options.ui,
      },
    };

    this.state = {
      filter: params.get("filter"),
      limit: parseInt(params.get("limit") || String(this.options.initialPageSize)),
      page: parseInt(params.get("page") || "1"),
      sort: params.get("sort") || "newest",
      view: (params.get("view") as ViewMode) || "list",
    };

    this.init();
  }

  private init() {
    this.container = document.getElementById(this.options.containerId);
    if (!this.container) {
      return;
    }

    const { ui } = this.options;
    if (ui) {
      this.listView = this.container.querySelector(ui.listViewSelector || ".list-view");
      this.gridView = this.container.querySelector(ui.gridViewSelector || ".grid-view");
      this.noResults = document.querySelector(ui.noResultsSelector || "#no-results");
      this.paginationNav = document.querySelector(ui.paginationSelector || "nav[aria-label=\"Pagination\"]");
    }

    // Initial Render
    this.updateViewMode();
    this.processItems();
  }

  private processItems() {
    if (!this.listView || !this.gridView) {
      return;
    }

    const processContainer = (parentContainer: Element): number => {
      if (!this.options.ui?.itemSelector) {
        return 0;
      }
      const items = Array.from(parentContainer.querySelectorAll(this.options.ui.itemSelector));

      // A. Sort
      items.sort((a, b) => {
        const titleA = a.getAttribute("data-title") || "";
        const titleB = b.getAttribute("data-title") || "";
        const dateA = parseInt(a.getAttribute("data-date") || "0");
        const dateB = parseInt(b.getAttribute("data-date") || "0");

        if (this.state.sort === "a-z") {
          return titleA.localeCompare(titleB);
        }
        if (this.state.sort === "oldest") {
          return dateA - dateB;
        }
        // newest
        return dateB - dateA;
      });

      // B. Filter
      const filteredItems = items.filter((item) => {
        if (!this.state.filter) {
          return true;
        }
        const tagString = item.getAttribute("data-tags") || "";
        const itemTags = tagString.split(",");
        return itemTags.includes(this.state.filter);
      });

      // C. Paginate (Slice)
      const startIndex = (this.state.page - 1) * this.state.limit;
      const endIndex = startIndex + this.state.limit;
      const visibleItems = filteredItems.slice(startIndex, endIndex);

      // D. Apply to DOM
      items.forEach((item) => {
        const isVisible = visibleItems.includes(item);
        if (isVisible) {
          item.classList.remove("hidden");
          // Re-appending sorts them visually in the DOM
          parentContainer.appendChild(item);
        }
        else {
          item.classList.add("hidden");
        }
      });

      return filteredItems.length;
    };

    const listCount = processContainer(this.listView);
    // For grid, if masonry is used, we might need to target the inner wrapper
    const gridWrapper = this.gridView.querySelector(".masonry-grid") || this.gridView;
    const gridCount = processContainer(gridWrapper);

    const totalResults = Math.max(listCount, gridCount);
    this.updatePaginationUI(totalResults);

    // No Results Handling
    if (this.noResults) {
      if (totalResults === 0) {
        this.noResults.classList.remove("hidden");
      }
      else {
        this.noResults.classList.add("hidden");
      }
    }
  }

  private updatePaginationUI(totalVisible: number) {
    const totalPages = Math.ceil(totalVisible / this.state.limit);

    // Update count label if it exists
    const countEl = document.getElementById("total-items-count");
    if (countEl) {
      const currentText = countEl.textContent || "";
      const parts = currentText.trim().split(" ");
      if (parts.length > 0 && !isNaN(parseInt(parts[0]))) {
        parts[0] = String(totalVisible);
        countEl.textContent = parts.join(" ");
      }
    }

    if (!this.paginationNav) {
      if (this.options.onUpdate) {
        this.options.onUpdate(totalVisible);
      }
      return;
    }

    if (totalPages <= 1) {
      this.paginationNav.classList.add("hidden");
    }
    else {
      this.paginationNav.classList.remove("hidden");
      const currentEl = this.paginationNav.querySelector(".text-foreground");
      const totalEl = this.paginationNav.querySelector(".text-muted-foreground.tabular-nums");
      const prevBtn = this.paginationNav.querySelector("a[href*=\"page\"]:first-child") as HTMLElement;
      const nextBtn = this.paginationNav.querySelector("a[href*=\"page\"]:last-child") as HTMLElement;

      // Update numbers
      if (currentEl) {
        currentEl.textContent = String(this.state.page);
      }
      if (totalEl) {
        totalEl.textContent = String(totalPages);
      }

      // Update buttons state
      if (prevBtn) {
        prevBtn.style.pointerEvents = this.state.page <= 1 ? "none" : "auto";
        prevBtn.style.opacity = this.state.page <= 1 ? "0.5" : "1";
      }
      if (nextBtn) {
        nextBtn.style.pointerEvents = this.state.page >= totalPages ? "none" : "auto";
        nextBtn.style.opacity = this.state.page >= totalPages ? "0.5" : "1";
      }
    }

    if (this.options.onUpdate) {
      this.options.onUpdate(totalVisible);
    }
  }

  private updateViewMode() {
    if (!this.listView || !this.gridView) {
      return;
    }

    if (this.state.view === "grid") {
      this.listView.classList.add("hidden");
      this.gridView.classList.remove("hidden");
    }
    else {
      this.gridView.classList.add("hidden");
      this.listView.classList.remove("hidden");
    }
  }
}
