/**
 * Image zoom utilities
 * Extracted from zoomable-image.astro for reuse
 */

export const initImageZoom = (): void => {
  const containers = document.querySelectorAll<HTMLElement>("[data-image-zoom]");
  for (const container of containers) {
    // Skip if already initialized
    if (container.hasAttribute("data-zoom-init")) {
      continue;
    }

    container.addEventListener("mousemove", (event) => {
      const img = container.querySelector("img");
      if (!img) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      img.style.transformOrigin = `${String(x * 100)}% ${String(y * 100)}%`;
    });

    container.setAttribute("data-zoom-init", "true");
  }
};
