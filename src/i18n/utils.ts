import { defaultLang, ui } from "./ui";

export const getLangFromUrl = (url: URL): keyof typeof ui => {
  const [, lang] = url.pathname.split("/");
  if (lang && lang in ui) {
    return lang as keyof typeof ui;
  }
  return defaultLang;
};

export const useTranslations =
  (lang: keyof typeof ui): ((key: keyof (typeof ui)[typeof defaultLang]) => string) =>
  (key: keyof (typeof ui)[typeof defaultLang]): string =>
    ui[lang][key] || ui[defaultLang][key];
