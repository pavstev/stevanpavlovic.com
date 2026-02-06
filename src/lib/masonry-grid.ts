/**
 * Initializes masonry grid by distributing items across columns
 */
export const initMasonry = (): void => {
  const grids = document.querySelectorAll<HTMLElement>(".masonry-grid");

  for (const grid of grids) {
    const columnsCount = parseInt(grid.dataset.masonryColumns || "2", 10);

    // Only apply masonry on desktop
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      // On mobile, just ensure items are direct children
      const items = Array.from(grid.querySelectorAll(".masonry-item"));
      for (const item of items) {
        if (item.parentElement === grid) continue;
        grid.appendChild(item);
      }
      grid.style.setProperty("--masonry-cols", "1");
      continue;
    }

    // Get all items
    const items = Array.from(grid.querySelectorAll(".masonry-item"));

    // Remove existing columns if any
    const existingColumns = grid.querySelectorAll(".masonry-column");
    for (const col of existingColumns) {
      col.remove();
    }

    // Create columns
    const columns: HTMLDivElement[] = [];
    for (let i = 0; i < columnsCount; i++) {
      const column = document.createElement("div");
      column.className = "masonry-column";
      columns.push(column);
      grid.appendChild(column);
    }

    // Distribute items across columns in order (left-to-right)
    for (let i = 0; i < items.length; i++) {
      const columnIndex = i % columnsCount;
      columns[columnIndex].appendChild(items[i]);
    }

    grid.style.setProperty("--masonry-cols", String(columnsCount));
  }
};
