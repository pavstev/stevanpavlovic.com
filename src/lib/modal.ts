/**
 * Initializes modal click-to-close behavior
 */
export const initModals = (): void => {
  const dialogs = document.querySelectorAll<HTMLDialogElement>("dialog");
  for (const dialog of dialogs) {
    if (dialog.hasAttribute("data-has-click-listener")) {
      continue;
    }

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    dialog.setAttribute("data-has-click-listener", "true");
  }
};
