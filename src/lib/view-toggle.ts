export const initViewToggle = (): void => {
  const container = document.querySelector(".view-content");
  if (!container) return;

  const listView = container.querySelector(".list-view-container");
  const gridView = container.querySelector(".grid-view-container");

  const toggleView = (view: string): void => {
    if (view === "grid") {
      listView?.classList.add("hidden");
      gridView?.classList.remove("hidden");
      return;
    }

    listView?.classList.remove("hidden");
    gridView?.classList.add("hidden");
  };

  // Check URL params for display mode
  const urlParams = new URLSearchParams(window.location.search);
  const displayParam = urlParams.get("display");

  if (displayParam === "grid" || displayParam === "list") {
    sessionStorage.setItem("preferred-view", displayParam);
  }

  const preferredView = sessionStorage.getItem("preferred-view") || "list";
  toggleView(preferredView);

  // Listen for custom toggle events from DisplayMenu or URL changes
  const handlePopState = (): void => {
    const newParams = new URLSearchParams(window.location.search);
    const newView = newParams.get("display") || sessionStorage.getItem("preferred-view") || "list";
    toggleView(newView);
  };

  window.addEventListener("popstate", handlePopState);
};
