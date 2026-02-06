import Worker from "./ai/worker?worker";

interface MessageData {
  message?: string;
  progress?: number;
  response?: string;
  sources?: Source[];
  status: string;
}

interface Source {
  title: string;
}

export class RagChat {
  private isOpen = false;
  private isReady = false;

  private ui = {
    close: document.getElementById("rag-close"),
    form: document.getElementById("rag-form") as HTMLFormElement,
    input: document.getElementById("rag-input") as HTMLInputElement,
    loader: document.getElementById("rag-loading-overlay"),
    loaderBar: document.getElementById("rag-loader-bar"),
    loaderText: document.getElementById("rag-loader-text"),
    messages: document.getElementById("rag-messages"),
    statusDot: document.getElementById("rag-status-indicator"),
    statusText: document.getElementById("rag-status-text"),
    submit: document.getElementById("rag-submit") as HTMLButtonElement,
    toggle: document.getElementById("rag-toggle"),
    window: document.getElementById("rag-window"),
  };

  private worker: null | Worker = null;

  constructor() {
    this.init();
  }

  private addBotResponse(text: string, sources: Source[]): void {
    const msg = document.createElement("div");
    msg.className = "flex gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-500";

    // Source HTML generation
    let sourcesHtml = "";
    if (sources && sources.length > 0) {
      const items = sources
        .map(
          (s) =>
            `<li class="truncate hover:text-primary transition-colors cursor-help" title="${s.title}">• ${s.title}</li>`,
        )
        .join("");
      sourcesHtml = `
          <div class="mt-3 border-t border-border/40 pt-2">
            <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Context Sources</p>
            <ul class="text-[10px] text-muted-foreground space-y-0.5">${items}</ul>
          </div>
        `;
    }

    msg.innerHTML = `
        <div class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" /></svg>
        </div>
        <div class="max-w-[85%] rounded-2xl rounded-tl-none bg-muted px-4 py-3 text-sm text-foreground shadow-sm">
          <div class="bot-text leading-relaxed"></div>
          ${sourcesHtml}
        </div>
      `;

    this.ui.messages?.appendChild(msg);

    // Typing Effect
    const textContainer = msg.querySelector(".bot-text");
    if (!textContainer) return;

    let i = 0;
    const typeInterval = setInterval(() => {
      textContainer.textContent += text.charAt(i);
      i++;
      this.scrollToBottom();
      if (i >= text.length) clearInterval(typeInterval);
    }, 15); // Speed of typing
  }

  private addMessage(text: string, type: "bot-error" | "user"): void {
    const msg = document.createElement("div");

    if (type === "user") {
      msg.className = "flex justify-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300";
      msg.innerHTML = `
          <div class="max-w-[85%] rounded-2xl rounded-tr-none bg-primary px-4 py-3 text-sm text-primary-foreground shadow-md">
            ${text}
          </div>
        `;
      this.ui.messages?.appendChild(msg);
      this.scrollToBottom();
      return;
    }

    msg.className = "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300";
    msg.innerHTML = `
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive mt-1">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" /></svg>
          </div>
          <div class="max-w-[85%] rounded-2xl rounded-tl-none bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
            ${text}
          </div>
        `;
    this.ui.messages?.appendChild(msg);
    this.scrollToBottom();
  }

  private bindEvents(): void {
    this.ui.toggle?.addEventListener("click", () => {
      this.toggle();
    });
    this.ui.close?.addEventListener("click", () => {
      this.toggle();
    });
    this.ui.form?.addEventListener("submit", (e) => {
      this.handleSubmit(e);
    });
  }

  private handleMessage(e: MessageEvent<MessageData>): void {
    const { message, progress, response, sources, status } = e.data;

    switch (status) {
      case "error":
        this.addMessage(message || "An error occurred.", "bot-error");
        this.updateStatus("error");
        return;
      case "generating":
        this.updateStatus("thinking");
        return;
      case "loading":
        this.updateLoader(progress || 0, String(message));
        return;
      case "ready":
        if (!this.isReady) {
          // First load complete
          this.isReady = true;
          this.hideLoader();
          this.updateStatus("online");
          return;
        }
        // Finished generating
        this.ui.input.disabled = false;
        this.ui.submit.disabled = false;
        this.ui.input.focus();
        this.updateStatus("online");
        return;
      default:
        break;
    }

    if (response) {
      // Add the bot response with typing effect
      this.addBotResponse(response, sources || []);
    }
  }

  private handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    const text = this.ui.input.value.trim();
    if (!text || !this.isReady) return;

    this.addMessage(text, "user");
    this.ui.input.value = "";
    this.ui.input.disabled = true;
    this.ui.submit.disabled = true;

    this.worker?.postMessage({ text, type: "query" });
  }

  private hideLoader(): void {
    this.ui.loader?.classList.add("opacity-0", "pointer-events-none");
    // Wait for transition then enable inputs
    setTimeout(() => {
      this.ui.input.disabled = false;
      this.ui.submit.disabled = false;
      this.ui.input.focus();
    }, 300);
  }

  private init(): void {
    this.bindEvents();
  }

  private initWorker(): void {
    if (this.worker) return;

    this.worker = new Worker();

    this.worker.addEventListener("message", (e: MessageEvent<MessageData>) => {
      this.handleMessage(e);
    });

    this.worker.postMessage({ type: "init" });
  }

  private scrollToBottom(): void {
    this.ui.messages?.scrollTo({
      behavior: "smooth",
      top: this.ui.messages.scrollHeight,
    });
  }

  private toggle(force?: boolean): void {
    this.isOpen = force !== undefined ? force : !this.isOpen;

    if (this.isOpen) {
      this.ui.window?.classList.remove("invisible", "opacity-0", "translate-y-8", "scale-95");
      this.ui.toggle?.classList.add("scale-0", "opacity-0");

      if (!this.worker) {
        this.initWorker();
        return;
      }
      setTimeout(() => {
        this.ui.input.focus();
      }, 100);
      return;
    }

    this.ui.window?.classList.add("opacity-0", "translate-y-8", "scale-95");
    this.ui.toggle?.classList.remove("scale-0", "opacity-0");
    setTimeout(() => {
      this.ui.window?.classList.add("invisible");
    }, 300);
  }

  private updateLoader(progress: number, message: string): void {
    if (!this.ui.loaderBar) return;
    this.ui.loaderBar.style.width = `${progress}%`;
    if (this.ui.loaderText) this.ui.loaderText.textContent = message;
  }

  private updateStatus(status: "error" | "online" | "thinking"): void {
    const colors = {
      error: "bg-red-500",
      online: "bg-green-500",
      thinking: "bg-blue-500 animate-ping",
    };
    const texts = {
      error: "Error",
      online: "Online",
      thinking: "Thinking...",
    };

    if (this.ui.statusDot)
      this.ui.statusDot.className = `absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card ${colors[status]}`;
    if (this.ui.statusText) this.ui.statusText.textContent = texts[status];
  }
}
