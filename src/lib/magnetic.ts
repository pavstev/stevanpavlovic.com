/**
 * Magnetic Interaction Logic
 * Small, high-end translation effect based on mouse proximity.
 */
export const initMagnetic = (): void => {
  const elements = document.querySelectorAll<HTMLElement>('[data-magnetic="true"]');

  for (const el of Array.from(elements)) {
    el.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      const { height, left, top, width } = el.getBoundingClientRect();

      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Subtle move (max 5px)
      const moveX = (deltaX / width) * 10;
      const moveY = (deltaY / height) * 10;

      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      el.style.transition = "transform 0.1s ease-out";
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
      el.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
    });
  }
};
