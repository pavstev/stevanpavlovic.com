const processCell = (cell: Element): void => {
  const text = cell.textContent?.trim() ?? "";
  // Check for pure numeric or currency/percentage strings
  if (/^[\d.,%$\-kMBt+]+$/.test(text) && text.length > 0) {
    cell.setAttribute("data-numeric", "true");
  }
  // Wrap success/failure keywords in badges if standalone
  if (
    /^(✅|❌|Active|Legacy|Target|Improvement|Improvement|Delta|improvement)/i.test(text) &&
    text.length < 20 &&
    !cell.querySelector(".status-pill")
  ) {
    const val = cell.innerHTML;
    cell.innerHTML = `<span class="status-pill">${val}</span>`;
  }
};

export const setupTableSorting = (): void => {
  const tables = document.querySelectorAll(".prose table");

  for (const table of tables) {
    const headers = table.querySelectorAll("th");
    const tbody = table.querySelector("tbody");

    if (!tbody) continue;

    // Smart Detection for numeric/status cells
    const rows = Array.from(tbody.querySelectorAll("tr"));
    for (const row of rows) {
      for (const cell of Array.from(row.children)) {
        processCell(cell);
      }
    }

    for (const [index, header] of Array.from(headers).entries()) {
      header.addEventListener("click", () => {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const isAscending = header.getAttribute("data-sort") === "asc";

        // Clear other headers
        for (const h of headers) {
          h.removeAttribute("data-sort");
        }

        rows.sort((a, b) => {
          const aVal = a.children[index].textContent?.trim() ?? "";
          const bVal = b.children[index].textContent?.trim() ?? "";

          const aNum = parseFloat(aVal.replace(/[^0-9.-]+/g, ""));
          const bNum = parseFloat(bVal.replace(/[^0-9.-]+/g, ""));

          if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? bNum - aNum : aNum - bNum;
          }

          return isAscending ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        });

        header.setAttribute("data-sort", isAscending ? "description" : "asc");

        // Re-append rows
        for (const row of rows) {
          tbody.appendChild(row);
        }
      });
    }
  }
};
