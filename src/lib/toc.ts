/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Lenis from "lenis";
import tocbot from "tocbot";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
let lenis: Lenis | null = null;

export const initLenis = (): void => {
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

export const initTocbot = (): void => {
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
