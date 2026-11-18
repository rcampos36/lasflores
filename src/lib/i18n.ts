export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_STORAGE_KEY = "las-flores-locale";

export const uiCopy = {
  es: {
    menu: "Menú",
    menuAria: "Principal",
    toggleLabel: "Cambiar idioma",
    viewProjects: "Ver los proyectos",
    nextProject: (title: string) =>
      `Ver el siguiente proyecto después de ${title}`,
  },
  en: {
    menu: "Menu",
    menuAria: "Main",
    toggleLabel: "Switch language",
    viewProjects: "View the projects",
    nextProject: (title: string) => `View next project after ${title}`,
  },
} as const;

export function menuLabel(
  item: { label: string; labelEn: string },
  locale: Locale,
) {
  return locale === "en" ? item.labelEn : item.label;
}

export function projectTags(
  project: { tags: [string, string]; tagsEn: [string, string] },
  locale: Locale,
): [string, string] {
  return locale === "en" ? project.tagsEn : project.tags;
}

export function projectImageAlt(
  project: { imageAlt: string; imageAltEn: string },
  locale: Locale,
) {
  return locale === "en" ? project.imageAltEn : project.imageAlt;
}

export function listingTitle(
  listing: { title: string; titleEn: string },
  locale: Locale,
) {
  return locale === "en" ? listing.titleEn : listing.title;
}

export function listingBlurb(
  listing: { blurb: string; blurbEn: string },
  locale: Locale,
) {
  return locale === "en" ? listing.blurbEn : listing.blurb;
}

export function listingItemLabel(
  item: { label: string; labelEn: string },
  locale: Locale,
) {
  return locale === "en" ? item.labelEn : item.label;
}

export function expertisesTitle(
  expertises: { title: string; titleEn: string },
  locale: Locale,
) {
  return locale === "en" ? expertises.titleEn : expertises.title;
}

export function expertisesCta(
  expertises: { cta: string; ctaEn: string },
  locale: Locale,
) {
  return locale === "en" ? expertises.ctaEn : expertises.cta;
}

export function expertiseItemTitle(
  item: { title: string; titleEn: string },
  locale: Locale,
) {
  return locale === "en" ? item.titleEn : item.title;
}

export function expertiseItemServices(
  item: { services: string[]; servicesEn: string[] },
  locale: Locale,
) {
  return locale === "en" ? item.servicesEn : item.services;
}

export function expertiseImageAlt(
  item: { imageAlt: string; imageAltEn: string },
  locale: Locale,
) {
  return locale === "en" ? item.imageAltEn : item.imageAlt;
}

export function closingHeadline(
  closing: { headline: string; headlineEn: string },
  locale: Locale,
) {
  return locale === "en" ? closing.headlineEn : closing.headline;
}

export function closingCta(
  closing: { cta: string; ctaEn: string },
  locale: Locale,
) {
  return locale === "en" ? closing.ctaEn : closing.cta;
}

export function closingLegal(
  closing: { legal: string; legalEn: string },
  locale: Locale,
) {
  return locale === "en" ? closing.legalEn : closing.legal;
}
