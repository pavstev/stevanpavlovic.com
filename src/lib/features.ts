declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

const GTM_ID = import.meta.env.PUBLIC_GTM_ID;

export const trackPageView = (path: string): void => {
  if (typeof window.gtag === "function") {
    window.gtag("config", GTM_ID, {
      page_path: path,
    });
  }
};
