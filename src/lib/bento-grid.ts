// 1. Clock Logic with Timezone Awareness & Locale
export function initBentoClock() {
  function updateTime() {
    const clock = document.getElementById("clock");
    if (clock) {
      const timezone = clock.dataset.timezone || "UTC";
      const locale = clock.dataset.locale || "en-US";
      const now = new Date();
      try {
        clock.textContent = new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          second: "2-digit",
          timeZone: timezone,
        }).format(now);
      } catch (e) {
        // Fallback to local time if timezone/locale is invalid
        clock.textContent = now.toLocaleTimeString();
      }
    }
  }
  setInterval(updateTime, 1000);
  updateTime();
}

export function initBentoGrid() {
  initBentoClock();
  initThemeToggle();
}

// 2. Theme Toggle Logic (Shadcn Compatible)
export function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  const htmlEl = document.documentElement;

  // Check system preference on load
  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    htmlEl.classList.add("dark");
  }

  toggleBtn?.addEventListener("click", () => {
    if (htmlEl.classList.contains("dark")) {
      htmlEl.classList.remove("dark");
      localStorage.setItem("theme", "light");
      return;
    }
    htmlEl.classList.add("dark");
    localStorage.setItem("theme", "dark");
  });
}
