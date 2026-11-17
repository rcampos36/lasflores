export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_STORAGE_KEY = "las-flores-locale";

export const uiCopy = {
  es: {
    menu: "Menú",
    menuAria: "Principal",
    toggleLabel: "Cambiar idioma",
    nextProject: (title: string) =>
      `Ver el siguiente proyecto después de ${title}`,
  },
  en: {
    menu: "Menu",
    menuAria: "Main",
    toggleLabel: "Switch language",
    nextProject: (title: string) => `View next project after ${title}`,
  },
} as const;

export function menuLabel(
  item: { label: string; labelEn: string },
  locale: Locale,
) {
  return locale === "en" ? item.labelEn : item.label;
}
