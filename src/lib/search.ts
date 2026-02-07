interface PagefindInstance {
  options: (options: { showImages: boolean }) => void;
  preload: (term: string) => Promise<void>;
  search: (query: string) => Promise<{
    results: PagefindResult[];
  }>;
}

interface PagefindResult {
  data: () => Promise<{
    content: string;
    excerpt: string;
    meta: {
      category?: string;
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

interface QuickAction {
  category: "Action" | "Navigation";
  href?: string;
  icon: string;
  id: string;
  label: string;
  onSelect?: () => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  { category: "Navigation", href: "/", icon: "mdi:home", id: "nav-home", label: "Go to Home" },
  { category: "Navigation", href: "/blog", icon: "mdi:newspaper", id: "nav-blog", label: "Go to Blog" },
  { category: "Navigation", href: "/projects", icon: "mdi:console", id: "nav-projects", label: "Go to Projects" },
  { category: "Navigation", href: "/resume", icon: "mdi:file-account", id: "nav-resume", label: "Go to Resume" },
  {
    category: "Action",
    icon: "mdi:download",
    id: "action-download-resume",
    label: "Download Resume PDF",
    onSelect: (): void => {
      window.print();
    },
  },
  {
    category: "Action",
    icon: "mdi:theme-light-dark",
    id: "action-toggle-focus",
    label: "Toggle Focus Mode",
    onSelect: (): void => {
      document.documentElement.classList.toggle("focus-mode");
    },
  },
];

class CommandPalette {
  private currentIndex = -1;
  private input: HTMLInputElement;
  private isOpen = false;
  private modal: HTMLDialogElement;
  private pagefind: null | PagefindInstance = null;
  private resultsContainer: HTMLElement;

  constructor(modalId: string) {
    this.modal = document.getElementById(modalId) as HTMLDialogElement;
    this.input = this.modal?.querySelector("#search-input") as HTMLInputElement;
    this.resultsContainer = this.modal?.querySelector("#search-results") as HTMLElement;

    if (this.modal) {
      this.init();
    }
  }

  public close(): void {
    this.isOpen = false;
    this.modal.close();
  }

  public open(): void {
    this.isOpen = true;
    this.modal.showModal();
    this.input.focus();
    void this.loadPagefind();
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
      return;
    }
    this.open();
  }

  private async fetchResults(query: string): Promise<void> {
    if (!query) {
      this.renderQuickActions();
      return;
    }

    if (!this.pagefind) {
      await this.loadPagefind();
    }

    if (this.pagefind) {
      const search = await this.pagefind.search(query);
      void this.renderSearchResults(search.results);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isOpen) {
      return;
    }

    const items = this.resultsContainer.querySelectorAll("a, button");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.currentIndex = Math.min(this.currentIndex + 1, items.length - 1);
      this.updateSelection(items);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.currentIndex = Math.max(this.currentIndex - 1, 0);
      this.updateSelection(items);
      return;
    }

    if (e.key === "Enter") {
      if (this.currentIndex >= 0) {
        e.preventDefault();
        (items[this.currentIndex] as HTMLElement).click();
      }
      return;
    }

    if (e.key === "Escape") {
      this.close();
    }
  }

  private init(): void {
    this.input.addEventListener("input", (e) => {
      void this.fetchResults((e.target as HTMLInputElement).value);
    });

    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        this.toggle();
      }
    });

    this.modal.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });

    this.modal.addEventListener("close", () => {
      this.isOpen = false;
      this.input.value = "";
      this.renderQuickActions();
    });

    this.renderQuickActions();
  }

  private async loadPagefind(): Promise<void> {
    try {
      this.pagefind = await import(/* @vite-ignore */ `${window.location.origin}/pagefind/pagefind.js`);
      this.pagefind?.options({ showImages: false });
    } catch (e) {
      console.warn("Pagefind failed to load", e);
    }
  }

  private renderQuickActions(): void {
    this.resultsContainer.innerHTML = `
      <div class="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Quick Actions</div>
      <div class="flex flex-col gap-1">
        ${QUICK_ACTIONS.map(
          (action) => `
          <button data-id="${action.id}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-foreground/80 group">
            <span class="size-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/30 transition-colors">
               <svg class="size-4"><use href="/icons.svg#${action.icon.replace("mdi:", "")}"></use></svg>
            </span>
            ${action.label}
            <span class="ml-auto text-[10px] font-mono text-muted-foreground/40">Action</span>
          </button>
        `,
        ).join("")}
      </div>
    `;

    this.currentIndex = -1;

    for (const btn of Array.from(this.resultsContainer.querySelectorAll("button"))) {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const action = QUICK_ACTIONS.find((a) => a.id === id);
        if (action?.href) {
          window.location.href = action.href;
          return;
        }
        if (action?.onSelect) {
          action.onSelect();
          this.close();
        }
      });
    }
  }

  private async renderSearchResults(results: PagefindResult[]): Promise<void> {
    this.resultsContainer.innerHTML = `
      <div class="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Search Results</div>
      <div class="flex flex-col gap-1"></div>
    `;
    const list = this.resultsContainer.querySelector(".flex-col") as HTMLElement;

    if (results.length === 0) {
      list.innerHTML = `<div class="p-8 text-center text-sm text-muted-foreground">No results found for "${this.input.value}"</div>`;
      return;
    }

    for (const result of Array.from(results.slice(0, 8))) {
      const data = await result.data();
      const item = document.createElement("a");
      item.href = data.url;
      item.className =
        "flex flex-col gap-1 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group border border-transparent hover:border-white/5";
      item.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">${data.meta.title}</span>
          ${data.meta.category ? `<span class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">${data.meta.category}</span>` : ""}
        </div>
        <span class="text-xs text-muted-foreground line-clamp-1">${data.excerpt}</span>
      `;
      list.appendChild(item);
    }
    this.currentIndex = -1;
  }

  private updateSelection(items: NodeListOf<Element>): void {
    let i = 0;
    for (const item of Array.from(items)) {
      const isActive = i === this.currentIndex;
      item.classList.toggle("bg-white/10", isActive);
      item.classList.toggle("border-primary/20", isActive);
      if (isActive) {
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      i++;
    }
  }
}

export const initSearchDropdown = (): void => {
  const palette = new CommandPalette("omni-search");

  // Global search trigger buttons (if any)
  for (const btn of Array.from(document.querySelectorAll("[data-search-trigger]"))) {
    btn.addEventListener("click", () => {
      palette.open();
    });
  }
};
