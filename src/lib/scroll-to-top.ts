export function initScrollToTop() {
  const btn = document.getElementById("smart-scroll-to-top");

  function updateVisibility() {
    if (!btn) return;
    const currentScrollY = window.scrollY;
    const threshold = 200;

    if (currentScrollY > threshold) {
      btn.classList.remove("translate-y-20", "opacity-0");
      btn.classList.add("translate-y-0", "opacity-100");
    } else {
      btn.classList.remove("translate-y-0", "opacity-100");
      btn.classList.add("translate-y-20", "opacity-0");
    }
  }

  function scrollToTop() {
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  if (btn) {
    btn.addEventListener("click", scrollToTop);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    // Initial check
    updateVisibility();
  }
}
