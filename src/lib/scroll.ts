/**
 * Initializes the smart scroll-to-top button
 * @param buttonId The ID of the button element
 */
export const initSmartScroll = (buttonId: string): void => {
  const btn = document.getElementById(buttonId);
  if (!btn) {
    return;
  }

  let isVisible = false;

  const toggleVisibility = (show: boolean): void => {
    if (show && !isVisible) {
      btn.classList.remove("translate-y-20", "opacity-0");
      btn.classList.add("translate-y-0", "opacity-100");
      isVisible = true;
      return;
    }
    if (!show && isVisible) {
      btn.classList.add("translate-y-20", "opacity-0");
      btn.classList.remove("translate-y-0", "opacity-100");
      isVisible = false;
    }
  };

  const handleScroll = (): void => {
    const currentScrollY = window.scrollY;
    const threshold = 200;
    toggleVisibility(currentScrollY > threshold);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ behavior: "smooth", top: 0 });
    (btn as HTMLButtonElement).blur();
  });
};
