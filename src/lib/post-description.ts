export function setupDescriptionToggles() {
  // Escape the slash in group/description for the selector
  const descriptions = document.querySelectorAll("details.group\\/description");

  descriptions.forEach((details) => {
    const text = details.querySelector(".description-text") as HTMLElement;
    const toggleWrapper = details.querySelector(".toggle-buttons") as HTMLElement;

    if (!text || !toggleWrapper) return;

    // Reset state to measure correctly
    const isCurrentlyOpen = (details as HTMLDetailsElement).open;
    if (isCurrentlyOpen) {
      (details as HTMLDetailsElement).open = false;
    }

    // Check if text is truncated
    const isTruncated = text.scrollHeight > text.offsetHeight;

    if (isTruncated) {
      toggleWrapper.classList.remove("hidden");
      toggleWrapper.classList.add("flex");
    } else {
      toggleWrapper.classList.add("hidden");
      toggleWrapper.classList.remove("flex");
      (details.querySelector("summary") as HTMLElement).style.cursor = "default";
    }

    // Restore state
    if (isCurrentlyOpen) {
      (details as HTMLDetailsElement).open = true;
    }
  });
}
