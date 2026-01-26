import { giscusConfig } from "./giscus";

const getGiscusTheme = (): string => {
  const isDark = document.documentElement.classList.contains("dark");
  return isDark ? "dark_protanopia" : "light";
};

const setGiscusTheme = (): void => {
  const theme = getGiscusTheme();
  const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
  if (!iframe?.contentWindow) {
    return;
  }

  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app",
  );
};

const loadGiscus = (): void => {
  const container = document.querySelector(".giscus");
  if (!container) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", giscusConfig.repo);
  script.setAttribute("data-repo-id", giscusConfig.repoId);
  script.setAttribute("data-category", giscusConfig.category);
  script.setAttribute("data-category-id", giscusConfig.categoryId);
  script.setAttribute("data-mapping", giscusConfig.mapping);
  script.setAttribute("data-reactions-enabled", giscusConfig.reactionsEnabled);
  script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata);
  script.setAttribute("data-input-position", giscusConfig.inputPosition);
  script.setAttribute("data-lang", giscusConfig.lang);
  script.setAttribute("data-loading", giscusConfig.loading);
  script.setAttribute("data-theme", getGiscusTheme());
  script.crossOrigin = "anonymous";
  script.async = true;

  container.innerHTML = "";
  container.appendChild(script);
};

export const initGiscus = (): void => {
  loadGiscus();

  const observer = new MutationObserver(() => {
    setGiscusTheme();
  });

  observer.observe(document.documentElement, {
    attributeFilter: ["class"],
    attributes: true,
  });
};
