import Lenis from "lenis";
import tocbot from "tocbot";

export const initFocusMode = (): void => {
  const focusBtn = document.getElementById("toggle-focus");
  if (!focusBtn) return;

  const toggleFocus = (): void => {
    document.documentElement.classList.toggle("focus-mode");
  };

  focusBtn.addEventListener("click", toggleFocus);

  const handleKeydown = (e: KeyboardEvent): void => {
    if (
      e.key.toLowerCase() === "f" &&
      !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
    ) {
      toggleFocus();
    }
  };

  window.addEventListener("keydown", handleKeydown);
};

export const initMobileMenu = (): void => {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!toggle || !menu) {
    return;
  }

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
  const links = document.querySelectorAll("[data-nav-link]");
  const currentPath = window.location.pathname.replace(/\/$/, "") ?? "/";

  const activeClasses = [
    "bg-foreground/10",
    "text-foreground",
    "ring-2",
    "ring-offset-foreground/20",
  ];
  const inactiveClasses = [
    "text-muted-foreground",
    "hover:bg-foreground/5",
    "hover:text-foreground",
  ];

  for (const link of links) {
    const href = link.getAttribute("href");
    const cleanHref = href?.replace(/\/$/, "") ?? "/";

    const isActive =
      cleanHref === "/"
        ? currentPath === "/"
        : currentPath === cleanHref || currentPath.startsWith(`${cleanHref}/`);

    const dot = link.querySelector(".rounded-full.bg-primary");

    if (isActive) {
      link.classList.add(...activeClasses);
      link.classList.remove(...inactiveClasses);
      link.setAttribute("aria-current", "page");

      if (dot) {
        dot.classList.remove("scale-0", "opacity-0");
      }

      continue;
    }

    link.classList.remove(...activeClasses);
    link.classList.add(...inactiveClasses);
    link.removeAttribute("aria-current");

    if (dot) {
      dot.classList.add("scale-0", "opacity-0");
    }
  }
};

export const initHeaderEffects = (): void => {
  const island = document.getElementById("nav-island");
  const progressBg = document.getElementById("nav-progress-bg");
  const brandWrapper = document.getElementById("brand-wrapper");
  const desktopNav = document.getElementById("desktop-nav");
  const actionsWrapper = document.getElementById("actions-wrapper");

  if (!island) return;

  const handleScroll = (): void => {
    const scroll = window.scrollY;
    const isScrolled = scroll > 50;

    if (isScrolled) {
      island.classList.add("h-11", "px-1.5", "scale-95", "border-primary/20", "bg-background/60");
      island.classList.remove("h-14", "px-2");

      if (brandWrapper) brandWrapper.style.opacity = "0.7";
      if (desktopNav) desktopNav.style.gap = "0.25rem";
      if (actionsWrapper) actionsWrapper.style.opacity = "0.8";
    }

    if (!isScrolled) {
      island.classList.remove(
        "h-11",
        "px-1.5",
        "scale-95",
        "border-primary/20",
        "bg-background/60"
      );
      island.classList.add("h-14", "px-2");

      if (brandWrapper) brandWrapper.style.opacity = "1";
      if (desktopNav) desktopNav.style.gap = "0.5rem";
      if (actionsWrapper) actionsWrapper.style.opacity = "1";
    }

    if (progressBg) {
      const winScroll = document.body.scrollTop ?? document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBg.style.width = `${scrolled}%`;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
};

const initMasonry = (): void => {
  const grids = document.querySelectorAll<HTMLElement>(".masonry-grid");

  for (const grid of grids) {
    const columnsCount = parseInt(grid.dataset.masonryColumns ?? "2", 10);

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      const items = Array.from(grid.querySelectorAll(".masonry-item"));
      for (const item of items) {
        if (item.parentElement === grid) continue;
        grid.appendChild(item);
      }
      grid.style.setProperty("--masonry-cols", "1");
      continue;
    }

    const items = Array.from(grid.querySelectorAll(".masonry-item"));

    const existingColumns = grid.querySelectorAll(".masonry-column");
    for (const col of existingColumns) {
      col.remove();
    }

    const columns: HTMLDivElement[] = [];
    for (let i = 0; i < columnsCount; i++) {
      const column = document.createElement("div");
      column.className = "masonry-column";
      columns.push(column);
      grid.appendChild(column);
    }

    for (let i = 0; i < items.length; i++) {
      const columnIndex = i % columnsCount;
      columns[columnIndex].appendChild(items[i]);
    }

    grid.style.setProperty("--masonry-cols", String(columnsCount));
  }
};

const setupMasonry = (): void => {
  initMasonry();

  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener("resize", (): void => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initMasonry, 150);
  });
};

let lenis: Lenis | null = null;

const initLenis = (): void => {
  if (lenis) lenis.destroy();

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  const raf = (time: number): void => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };

  requestAnimationFrame(raf);

  const anchors = document.querySelectorAll('a[href^="#"]');
  for (const anchor of anchors) {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        lenis?.scrollTo(targetId, {
          offset: -100,
        });
      }
    });
  }
};

const initTocbot = (): void => {
  tocbot.destroy();
  tocbot.init({
    activeLinkClass: "is-active-link",
    activeListItemClass: "is-active-li",
    contentSelector: "article",
    hasInnerContainers: true,
    headingSelector: "h2, h3",
    headingsOffset: 100,
    linkClass: "toc-link",
    listClass: "space-y-2 border-l border-border text-sm",
    listItemClass: "relative",
    scrollSmooth: false,
    tocSelector: ".js-toc",
  });
};

export const setupTOC = (): void => {
  initLenis();
  initTocbot();
};

export const initInteractiveCards = (): void => {
  const cards = document.querySelectorAll(".group\\/card");

  for (let i = 0; i < cards.length; i++) {
    const card = cards.item(i);
    if (!(card instanceof HTMLElement)) {
      continue;
    }

    const handleMouseMove = (e: Event): void => {
      const mouseEvent = e as MouseEvent;
      const rect = card.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;

      card.style.setProperty("--mouse-x", String(x) + "px");
      card.style.setProperty("--mouse-y", String(y) + "px");
    };

    card.addEventListener("mousemove", handleMouseMove);
  }
};
