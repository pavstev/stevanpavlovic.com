export const initScrollToTop = (): void => {
  const btn = document.getElementById("smart-scroll-to-top");

  const updateVisibility = (): void => {
    if (!btn) return;
    const currentScrollY = window.scrollY;
    const threshold = 200;

    if (currentScrollY > threshold) {
      btn.classList.remove("translate-y-20", "opacity-0");
      btn.classList.add("translate-y-0", "opacity-100");
      return;
    }

    btn.classList.remove("translate-y-0", "opacity-100");
    btn.classList.add("translate-y-20", "opacity-0");
  };

  const scrollToTop = (): void => {
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  if (btn) {
    btn.addEventListener("click", scrollToTop);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    // Initial check
    updateVisibility();
  }
};
