import { BrandWordmark } from "@/components/brand-wordmark";
import { getSiteContent } from "@/lib/content";

export default async function ProjectLoading() {
  const content = await getSiteContent();

  return (
    <div className="project-page-loading" aria-busy="true" aria-live="polite">
      <div className="@container boot-splash__brand">
        <BrandWordmark
          tone="white"
          name={content.brand.name}
          className="boot-splash__logo"
          priority
        />
        <p
          className="boot-splash__tagline creative-co flex justify-between font-thin text-[clamp(2rem,8.6cqw,3.85rem)] leading-none text-[#3858E9] uppercase"
          aria-label={content.brand.tagline}
        >
          {content.brand.tagline.split("").map((char, index) => (
            <span
              key={`loading-splash-${char}-${index}`}
              aria-hidden={char === " "}
            >
              {char === " " ? "\u00a0" : char}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
