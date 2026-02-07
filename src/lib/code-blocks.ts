export const initCodeBlocks = (): void => {
  const codeBlocks = document.querySelectorAll("pre");

  for (const block of codeBlocks) {
    // 1. Setup Wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "relative group/code mb-6";
    block.parentNode?.insertBefore(wrapper, block);
    wrapper.appendChild(block);

    // 2. Add Header HUD
    const lang = block.getAttribute("data-language") || "code";

    const iconMap: Record<string, string> = {
      bash: "terminal",
      css: "css",
      html: "html",
      js: "javascript",
      json: "code-json",
      jsx: "react",
      md: "markdown",
      sh: "terminal",
      ts: "typescript",
      tsx: "react",
    };

    const iconName = iconMap[lang.toLowerCase()] || "code-braces";

    const header = document.createElement("div");
    header.className =
      "absolute top-0 right-0 flex items-center justify-between w-full px-4 py-2 border-b border-white/5 bg-white/5 opacity-0 group-hover/code:opacity-100 transition-opacity duration-300 pointer-events-none rounded-t-xl";
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="size-3.5 text-muted-foreground/60"><use href="/icons.svg#${iconName}"></use></svg>
        <span class="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">${lang}</span>
      </div>
      <button class="pointer-events-auto p-1 text-muted-foreground hover:text-primary transition-colors active:scale-90 copy-btn" title="Copy Code">
        <svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1M3 10v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z"></path></svg>
      </button>
    `;
    wrapper.insertBefore(header, block);

    // 3. Copy Logic
    const btn = header.querySelector(".copy-btn");
    btn?.addEventListener("click", () => {
      void (async (): Promise<void> => {
        const code = block.querySelector("code")?.innerText || block.innerText;
        await navigator.clipboard.writeText(code);

        // Feedback
        const originalIcon = btn.innerHTML;
        btn.innerHTML = `<svg class="size-3.5 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"></path></svg>`;
        setTimeout(() => {
          btn.innerHTML = originalIcon;
        }, 2000);
      })();
    });
  }
};
