interface ChatMessage {
  id: string;
  isAi: boolean;
  text: string;
}

export const createMessageElement = (message: ChatMessage, variants: { ai: string; user: string }): HTMLDivElement => {
  const container = document.createElement("div");
  container.className = `flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ${message.isAi ? "" : "items-end"}`;

  const bubble = document.createElement("div");
  bubble.className = `max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${message.isAi ? variants.ai : variants.user}`;
  bubble.textContent = message.text;

  const timestamp = document.createElement("span");
  timestamp.className = "text-[10px] text-muted-foreground/60 px-1";
  timestamp.textContent = message.isAi ? "AI" : "You";

  container.appendChild(bubble);
  container.appendChild(timestamp);
  return container;
};

export const createTypingIndicator = (): HTMLDivElement => {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-1 animate-in fade-in";
  container.id = "typing-indicator";

  const bubble = document.createElement("div");
  bubble.className = "flex items-center gap-1 rounded-2xl rounded-tl-none bg-muted/80 px-4 py-3";
  bubble.innerHTML = `
      <span class="inline-block size-2 animate-bounce rounded-full bg-muted-foreground/60" style="animation-delay: 0ms;"></span>
      <span class="inline-block size-2 animate-bounce rounded-full bg-muted-foreground/60" style="animation-delay: 150ms;"></span>
      <span class="inline-block size-2 animate-bounce rounded-full bg-muted-foreground/60" style="animation-delay: 300ms;"></span>
    `;

  const timestamp = document.createElement("span");
  timestamp.className = "text-[10px] text-muted-foreground/60 px-1";
  timestamp.textContent = "AI";

  container.appendChild(bubble);
  container.appendChild(timestamp);
  return container;
};

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

export const initInteractiveCards = (): void => {
  const cards = document.querySelectorAll(".group\\/card");

  for (const card of cards) {
    if (!(card instanceof HTMLElement)) {
      continue;
    }

    const handleMouseMove = (e: Event): void => {
      const mouseEvent = e as MouseEvent;
      const rect = card.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;

      card.style.setProperty("--mouse-x", String(x) + "px");
      card.style.setProperty("--mouse-y", String(y) + "px");
    };

    card.addEventListener("mousemove", handleMouseMove);
  }
};

export const scrollToBottom = (container: HTMLElement | null): void => {
  if (container) {
    container.scrollTo({
      behavior: "smooth",
      top: container.scrollHeight,
    });
  }
};

export const updateStatus = (element: HTMLElement | null, text: string): void => {
  if (element) {
    element.textContent = text;
  }
};
