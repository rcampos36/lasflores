import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

export type MenuItem = {
  href: string;
  label: string;
  labelEn: string;
  color: string;
};

export type SocialLink = {
  href: string;
  label: string;
};

export type Project = {
  id: string;
  title: string;
  year: string;
  tags: [string, string];
  tagsEn: [string, string];
  image: string | null;
  imageAlt: string;
  imageAltEn: string;
  color: string;
  media: string;
  /** URL segment for /proyectos/[slug] */
  slug?: string;
  cta?: string;
  ctaEn?: string;
  /** External or in-page link for the detail CTA */
  ctaHref?: string;
};

export type ListingItem = {
  id: string;
  label: string;
  labelEn: string;
};

export type ListingContent = {
  title: string;
  titleEn: string;
  blurb: string;
  blurbEn: string;
  items: ListingItem[];
};

export type ExpertiseItem = {
  id: string;
  title: string;
  titleEn: string;
  services: string[];
  servicesEn: string[];
  color: string;
  image: string | null;
  imageAlt: string;
  imageAltEn: string;
};

export type ExpertisesContent = {
  title: string;
  titleEn: string;
  cta: string;
  ctaEn: string;
  items: ExpertiseItem[];
};

export type ClosingContent = {
  headline: string;
  headlineEn: string;
  cta: string;
  ctaEn: string;
  ctaHref: string;
  address: string[];
  emails: string[];
  phone: string;
  legal: string;
  legalEn: string;
  legalHref: string;
  copyright: string;
};

export type SiteContent = {
  brand: {
    name: string;
    tagline: string;
    title: string;
    description: string;
  };
  menu: MenuItem[];
  socials: SocialLink[];
  listing: ListingContent;
  projects: Project[];
  expertises?: ExpertisesContent;
  closing?: ClosingContent;
};

const contentPath = path.join(process.cwd(), "content", "site.json");

export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag("site-content");
  const raw = await readFile(contentPath, "utf8");
  return JSON.parse(raw) as SiteContent;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export function isValidSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const data = value as SiteContent;
  return (
    typeof data.brand?.name === "string" &&
    typeof data.brand?.tagline === "string" &&
    typeof data.brand?.title === "string" &&
    typeof data.brand?.description === "string" &&
    Array.isArray(data.menu) &&
    Array.isArray(data.socials) &&
    typeof data.listing?.title === "string" &&
    typeof data.listing?.titleEn === "string" &&
    typeof data.listing?.blurb === "string" &&
    typeof data.listing?.blurbEn === "string" &&
    Array.isArray(data.listing?.items) &&
    Array.isArray(data.projects) &&
    (data.expertises === undefined ||
      (typeof data.expertises?.title === "string" &&
        typeof data.expertises?.titleEn === "string" &&
        typeof data.expertises?.cta === "string" &&
        typeof data.expertises?.ctaEn === "string" &&
        Array.isArray(data.expertises?.items))) &&
    (data.closing === undefined ||
      (typeof data.closing?.headline === "string" &&
        typeof data.closing?.headlineEn === "string" &&
        typeof data.closing?.cta === "string" &&
        typeof data.closing?.ctaEn === "string" &&
        typeof data.closing?.ctaHref === "string" &&
        Array.isArray(data.closing?.address) &&
        Array.isArray(data.closing?.emails) &&
        typeof data.closing?.phone === "string" &&
        typeof data.closing?.legal === "string" &&
        typeof data.closing?.legalEn === "string" &&
        typeof data.closing?.legalHref === "string" &&
        typeof data.closing?.copyright === "string"))
  );
}
