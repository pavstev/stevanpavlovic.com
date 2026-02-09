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
