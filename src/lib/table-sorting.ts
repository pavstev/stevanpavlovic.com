export function setupTableSorting() {
  const tables = document.querySelectorAll(".prose table");

  tables.forEach((table) => {
    const headers = table.querySelectorAll("th");
    const tbody = table.querySelector("tbody");

    if (!tbody) return;

    // Smart Detection for numeric/status cells
    const rows = Array.from(tbody.querySelectorAll("tr"));
    rows.forEach((row) => {
      Array.from(row.children).forEach((cell) => {
        const text = cell.textContent?.trim() ?? "";
        // Check for pure numeric or currency/percentage strings
        if (/^[\d.,%$\-kMBt+]+$/.test(text) && text.length > 0) {
          cell.setAttribute("data-numeric", "true");
        }
        // Wrap success/failure keywords in badges if standalone
        if (
          /^(✅|❌|Active|Legacy|Target|Improvement|Improvement|Delta|improvement)/i.test(text) &&
          text.length < 20
        ) {
          if (!cell.querySelector(".status-pill")) {
            const val = cell.innerHTML;
            cell.innerHTML = `<span class="status-pill">${val}</span>`;
          }
        }
      });
    });

    headers.forEach((header, index) => {
      header.addEventListener("click", () => {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const isAscending = header.getAttribute("data-sort") === "asc";

        // Clear other headers
        headers.forEach((h) => h.removeAttribute("data-sort"));

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
        rows.forEach((row) => tbody.appendChild(row));
      });
    });
  });
}
