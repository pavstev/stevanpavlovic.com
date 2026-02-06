export function initResumeGenerator() {
  // Handle PDF Generation
  const printBtn = document.getElementById("print-btn");
  printBtn?.addEventListener("click", () => {
    // Optional: Change title temporarily so the PDF file name is nice
    const originalTitle = document.title;
    document.title = "Stevan_Doe_Resume";
    window.print();
    document.title = originalTitle;
  });

  // Handle "Delete Item" buttons (Simple DOM removal)
  const buttons = document.querySelectorAll(".delete-btn");
  for (const btn of buttons) {
    btn.addEventListener("click", (e) => {
      // Find the parent group and remove it
      const item = (e.target as HTMLElement).closest(".group");
      if (item && confirm("Remove this item?")) {
        item.remove();
      }
    });
  }
}
