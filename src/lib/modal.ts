/**
 * Handles scroll locking for a single dialog mutation
 */
const handleDialogMutation = (dialog: Element, mutation: MutationRecord): void => {
  if (mutation.type !== "attributes" || mutation.attributeName !== "open") {
    return;
  }

  if (dialog.hasAttribute("open")) {
    document.body.style.overflow = "hidden";
    // Prevent layout shift by adding padding-right equal to scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${String(scrollbarWidth)}px`;
    }
    return;
  }

  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

/**
 * Resets body scroll styles
 */
const resetBodyScroll = (): void => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

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

/**
 * Sets up scroll locking when modals are opened
 */
export const setupScrollLock = (): void => {
  const dialogs = document.querySelectorAll("dialog");

  for (const dialog of dialogs) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        handleDialogMutation(dialog, mutation);
      }
    });

    observer.observe(dialog, { attributes: true });

    dialog.addEventListener("close", resetBodyScroll);
    dialog.addEventListener("cancel", resetBodyScroll);
  }
};
