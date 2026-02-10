export const setupDescriptionToggles = (): void => {
  const descriptions = document.querySelectorAll("details.group\\/description");

  for (const details of descriptions) {
    const text = details.querySelector(".description-text") as HTMLElement;
    const toggleWrapper = details.querySelector(".toggle-buttons") as HTMLElement;

    if (!text || !toggleWrapper) {
      continue;
    }

    const isCurrentlyOpen = (details as HTMLDetailsElement).open;
    if (isCurrentlyOpen) {
      (details as HTMLDetailsElement).open = false;
    }

    const isTruncated = text.scrollHeight > text.offsetHeight;

    if (!isTruncated) {
      toggleWrapper.classList.add("hidden");
      toggleWrapper.classList.remove("flex");
      (details.querySelector("summary") as HTMLElement).style.cursor = "default";
      if (isCurrentlyOpen) {
        (details as HTMLDetailsElement).open = true;
      }
      continue;
    }

    toggleWrapper.classList.remove("hidden");
    toggleWrapper.classList.add("flex");

    if (isCurrentlyOpen) {
      (details as HTMLDetailsElement).open = true;
    }
  }
};
