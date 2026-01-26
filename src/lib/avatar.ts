/**
 * Initializes avatar zoom effect
 */
export const initAvatarZoom = (): void => {
  const containers = document.querySelectorAll<HTMLElement>("[data-avatar-zoom]");
  for (const container of containers) {
    if (container.hasAttribute("data-zoom-init")) {
      continue;
    }

    container.addEventListener("mousemove", (event: MouseEvent) => {
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
