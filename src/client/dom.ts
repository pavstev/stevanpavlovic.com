export const initFocusMode = (): void => {
  const focusBtn = document.getElementById("toggle-focus");
  if (!focusBtn) return;

  const toggleFocus = (): void => {
    document.documentElement.classList.toggle("focus-mode");
  };

  focusBtn.addEventListener("click", toggleFocus);

  const handleKeydown = (e: KeyboardEvent): void => {
    if (
      e.key.toLowerCase() === "f" &&
      !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
    ) {
      toggleFocus();
    }
  };

  window.addEventListener("keydown", handleKeydown);
};
