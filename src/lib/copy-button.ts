/**
 * Logic to inject copy buttons into Shiki-generated HTML
 */
export const initCopyButtons = () => {
  const codeBlocks = document.querySelectorAll("pre");
  const idleTemplate = document.querySelector("#copy-button-template > button");
  const successTemplate = document.querySelector("#copy-success-template > button");

  if (!idleTemplate || !successTemplate) return;

  codeBlocks.forEach((codeBlock) => {
    // Prevent duplicate buttons on View Transition swap
    if (codeBlock.querySelector(".copy-code-button")) return;

    // Layout adjustments for the code block
    codeBlock.style.position = "relative";
    codeBlock.classList.add("group");

    // Clone the idle button from our Astro template
    const button = idleTemplate.cloneNode(true) as HTMLButtonElement;
    codeBlock.appendChild(button);

    button.addEventListener("click", async () => {
      const code = codeBlock.querySelector("code");
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.innerText);

        // Swap to success state by cloning the success template's inner content
        const originalHTML = button.innerHTML;
        const successHTML = successTemplate.innerHTML;

        button.innerHTML = successHTML;
        button.classList.add("border-green-500/50");

        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove("border-green-500/50");
        }, 2000);
      } catch (err) {
        throw new Error("Failed to copy code:", {
          cause: err,
        });
      }
    });
  });
};
