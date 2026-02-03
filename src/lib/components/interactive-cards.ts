/**
 * Interactive Cards Utilities
 * Handles spotlight/glow effects for cards
 */

export const initAllComponents = (): void => {
  initInteractiveCards();
};

export const initInteractiveCards = (): void => {
  const cards = document.querySelectorAll(".group/card");

  for (const card of cards) {
    if (!(card instanceof HTMLElement)) { continue; }

    const handleMouseMove = (e: MouseEvent): void => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", String(x) + "px");
      card.style.setProperty("--mouse-y", String(y) + "px");
    };

    card.addEventListener("mousemove", handleMouseMove);
  }
};

export const withPageLoad = (fn: () => void): (() => void) => () => {
  fn();
  document.addEventListener("astro:page-load", fn);
};
