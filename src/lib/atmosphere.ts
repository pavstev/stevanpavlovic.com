import dayjs from "dayjs";

interface AtmosphereResponse {
  localTime: string;
  status: "active" | "sleeping";
  temp: number;
}

export class AtmosphereWidget {
  private belgradeTime: Date | null = null;

  private els = {
    dot: document.getElementById("atmo-dot"),
    msg: document.getElementById("availability-msg"),
    overlap: document.getElementById("time-overlap-bar"),
    ping: document.getElementById("atmo-ping"),
    popover: document.getElementById("timezone-popover"),
    status: document.getElementById("atmo-status"),
    stevanTime: document.getElementById("popover-stevan-time"),
    time: document.getElementById("atmo-time"),
    trigger: document.getElementById("atmosphere-trigger"),
    userTime: document.getElementById("popover-user-time"),
  };

  private isOpen = false;

  constructor() {
    this.init().catch(() => {
      /* ignore */
    });
    this.bindEvents();
  }

  private bindEvents(): void {
    // Toggle Popover
    this.els.trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (
        this.isOpen &&
        !this.els.popover?.contains(e.target as Node) &&
        !this.els.trigger?.contains(e.target as Node)
      ) {
        this.toggle(false);
      }
    });

    // Timezone Simulation Buttons
    const buttons = document.querySelectorAll(".tz-btn");
    for (const btn of buttons) {
      btn.addEventListener("click", (e) => {
        const offset = parseInt((e.currentTarget as HTMLElement).dataset.offset || "0");
        this.simulateZone(offset);
      });
    }
  }

  private async init(): Promise<void> {
    try {
      const res = await fetch("/api/atmosphere.json");
      if (!res.ok) throw new Error("Failed");
      const data: AtmosphereResponse = await res.json();

      this.belgradeTime = dayjs(data.localTime).toDate() as Date;
      this.updateUI(data);
      this.startClock();
    } catch {
      if (this.els.status) this.els.status.innerText = "Offline";
    }
  }

  private simulateZone(offset: number, isLocal = false): void {
    let simulatedTime = new Date();

    if (!isLocal) {
      // Just a visual simulation for the "You" time in the popover
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      simulatedTime = new Date(utc + 3600000 * offset);
    }

    if (this.els.userTime) {
      this.els.userTime.innerText =
        simulatedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + (isLocal ? "" : " (Sim)");
      this.els.userTime.classList.add("text-[var(--color-primary)]");
    }

    // Calculate overlap logic (simple heuristic)
    if (this.belgradeTime) {
      const diff = Math.abs(this.belgradeTime.getHours() - simulatedTime.getHours());
      // Simple overlap visual: If diff is small, bars overlap more
      // Normalize diff to 0-1 range where 0 diff = 100% width
      const overlapPercent = Math.max(10, 100 - diff * 4);

      if (this.els.overlap) {
        this.els.overlap.style.width = `${overlapPercent}%`;
        // Color code based on "good time to call" (9am-5pm overlap)
        // This is a rough heuristic
        const isGood = diff < 4;
        this.els.overlap.style.backgroundColor = isGood ? "var(--color-primary)" : "var(--color-muted)";
      }

      if (this.els.msg) {
        const isGood = diff < 4;
        this.els.msg.innerText = isGood
          ? "Great overlap! Good time to connect."
          : "Significant time difference. Expect async replies.";
        this.els.msg.style.color = isGood ? "var(--color-primary)" : "var(--color-destructive)";
      }
    }
  }

  private startClock(): void {
    setInterval(() => {
      if (!this.belgradeTime) return;
      // Advance time manually since we fetched a snapshot
      this.belgradeTime.setSeconds(this.belgradeTime.getSeconds() + 1);

      const fmt = (d: Date): string => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (this.els.time) this.els.time.innerText = fmt(this.belgradeTime);
      if (this.els.stevanTime) this.els.stevanTime.innerText = fmt(this.belgradeTime);
      if (this.els.userTime) this.els.userTime.innerText = fmt(new Date());
    }, 1000);
  }

  private toggle(force?: boolean): void {
    this.isOpen = force !== undefined ? force : !this.isOpen;

    if (this.isOpen) {
      this.els.popover?.classList.remove("invisible", "opacity-0", "scale-95");
      this.els.popover?.classList.add("opacity-100", "scale-100");
      // Initial simulation for current user time
      // Rough estimate, better to just show current local time
      this.simulateZone(0, true);
      return;
    }

    this.els.popover?.classList.remove("opacity-100", "scale-100");
    this.els.popover?.classList.add("opacity-0", "scale-95");
    setTimeout(() => this.els.popover?.classList.add("invisible"), 200);
  }

  private updateUI(data: AtmosphereResponse): void {
    if (!this.els.time || !this.els.status || !this.els.dot) return;

    // Status Colors
    const isSleeping = data.status === "sleeping";
    const activeColor = "#10b981"; // Emerald
    const sleepColor = "#f59e0b"; // Amber

    this.els.dot.style.backgroundColor = isSleeping ? sleepColor : activeColor;
    if (this.els.ping) this.els.ping.style.backgroundColor = isSleeping ? sleepColor : activeColor;

    if (isSleeping) {
      this.els.ping?.classList.add("hidden");
      this.els.status.innerText = `Stevan is likely sleeping (${data.temp}°C)`;
      return;
    }

    this.els.ping?.classList.remove("hidden");
    this.els.status.innerText = `Stevan is active (${data.temp}°C)`;
  }
}
