export const initModals = (): void => {
  const dialogs = document.querySelectorAll("dialog.group\\/modal");

  for (const dialog of dialogs) {
    if (!(dialog instanceof HTMLDialogElement)) continue;

    const closeBtn = dialog.querySelector(".close-modal-btn");

    const close = (): void => {
      dialog.close();
      document.body.style.overflow = "";
    };

    // Close on backdrop click
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        close();
      }
    });

    // Close button
    closeBtn?.addEventListener("click", close);

    // Handle scroll lock when open
    // We can't easily detect "open" property change without MutationObserver calling back.
    // But showing is usually done via .showModal() called externally.
    // The script opening it should handle scroll lock?
    // Or we can observe attributes.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "open") {
          if (!dialog.open) {
            document.body.style.overflow = "";
            continue;
          }
          document.body.style.overflow = "hidden";
        }
      }
    });
    observer.observe(dialog, { attributes: true });
  }
};
