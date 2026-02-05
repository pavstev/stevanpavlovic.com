import { atom } from "nanostores";

type Theme = "dark" | "light" | "system";

export const themeStore = atom<Theme>("system");

export const setTheme = (theme: Theme): void => {
  themeStore.set(theme);

  if (typeof localStorage !== "undefined") {
    if (theme === "system") {
      localStorage.removeItem("theme");
      applySystemTheme();
    } else {
      localStorage.setItem("theme", theme);
      applyTheme(theme);
    }
  }
};

const applyTheme = (theme: Theme): void => {
  if (typeof document !== "undefined") {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};

const applySystemTheme = (): void => {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("theme") as null | Theme;
  if (saved && ["dark", "light"].includes(saved)) {
    themeStore.set(saved);
  } else {
    themeStore.set("system");
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (themeStore.get() === "system") {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  });
}
