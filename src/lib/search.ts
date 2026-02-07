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
    onSelect: () => {
      window.print();
    },
  },
  {
    category: "Action",
    icon: "mdi:theme-light-dark",
    id: "action-toggle-focus",
    label: "Toggle Focus Mode",
    onSelect: () => document.documentElement.classList.toggle("focus-mode"),
  },
];

class CommandPalette {
  private currentIndex = -1;
  private dropdown: HTMLElement;
  private input: HTMLInputElement;
  private isOpen = false;
  private modal: HTMLElement;
  private pagefind: null | PagefindInstance = null;
  private resultsContainer: HTMLElement;

  constructor(modalId: string) {
    this.modal = document.getElementById(modalId) as HTMLElement;
    this.input = this.modal?.querySelector("#search-input") as HTMLInputElement;
    this.resultsContainer = this.modal?.querySelector("#search-results") as HTMLElement;
    this.dropdown = this.modal?.querySelector("dialog") as HTMLElement;

    if (this.modal) {
      this.init();
    }
  }

  public close() {
    this.isOpen = false;
    this.modal.classList.add("invisible", "opacity-0");
    this.dropdown?.classList.add("scale-95", "translate-y-4");
    document.body.style.overflow = "";
  }

  public open() {
    this.isOpen = true;
    this.modal.classList.remove("invisible", "opacity-0");
    this.dropdown?.classList.remove("scale-95", "translate-y-4");
    this.input.focus();
    document.body.style.overflow = "hidden";
    void this.loadPagefind();
  }

  public toggle() {
    this.isOpen ? this.close() : this.open();
  }

  private async fetchResults(query: string) {
    if (!query) {
      this.renderQuickActions();
      return;
    }

    if (!this.pagefind) {
      await this.loadPagefind();
    }

    if (this.pagefind) {
      const search = await this.pagefind.search(query);
      this.renderSearchResults(search.results);
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.isOpen) return;

    const items = this.resultsContainer.querySelectorAll("a, button");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.currentIndex = Math.min(this.currentIndex + 1, items.length - 1);
      this.updateSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.currentIndex = Math.max(this.currentIndex - 1, 0);
      this.updateSelection(items);
    } else if (e.key === "Enter") {
      if (this.currentIndex >= 0) {
        e.preventDefault();
        (items[this.currentIndex] as HTMLElement).click();
      }
    } else if (e.key === "Escape") {
      this.close();
    }
  }

  private init() {
    this.input.addEventListener("input", (e) => {
      this.fetchResults((e.target as HTMLInputElement).value);
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

    // Close on backdrop click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    this.renderQuickActions();
  }

  private async loadPagefind() {
    try {
      // @ts-ignore - Pagefind is generated at build time
      this.pagefind = await import(/* @vite-ignore */ "/pagefind/pagefind.js");
      this.pagefind?.options({ showImages: false });
    } catch (e) {
      console.warn("Pagefind failed to load", e);
    }
  }

  private renderQuickActions() {
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

    this.resultsContainer.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const action = QUICK_ACTIONS.find((a) => a.id === id);
        if (action?.href) {
          window.location.href = action.href;
        } else if (action?.onSelect) {
          action.onSelect();
          this.close();
        }
      });
    });
  }

  private async renderSearchResults(results: PagefindResult[]) {
    this.resultsContainer.innerHTML = `
      <div class="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Search Results</div>
      <div class="flex flex-col gap-1"></div>
    `;
    const list = this.resultsContainer.querySelector(".flex-col") as HTMLElement;

    if (results.length === 0) {
      list.innerHTML = `<div class="p-8 text-center text-sm text-muted-foreground">No results found for "${this.input.value}"</div>`;
      return;
    }

    for (const result of results.slice(0, 8)) {
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

  private updateSelection(items: NodeListOf<Element>) {
    items.forEach((item, i) => {
      if (i === this.currentIndex) {
        item.classList.add("bg-white/10", "border-primary/20");
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        item.classList.remove("bg-white/10", "border-primary/20");
      }
    });
  }
}

export const initSearchDropdown = () => {
  const palette = new CommandPalette("omni-search");

  // Global search trigger buttons (if any)
  document.querySelectorAll("[data-search-trigger]").forEach((btn) => {
    btn.addEventListener("click", () => {
      palette.open();
    });
  });
};
