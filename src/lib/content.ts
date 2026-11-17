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
  image: string | null;
  imageAlt: string;
  color: string;
  media: string;
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
  projects: Project[];
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
    Array.isArray(data.projects)
  );
}
