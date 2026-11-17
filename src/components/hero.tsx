import { HeroScroll } from "@/components/hero-scroll";
import type { SiteContent } from "@/lib/content";

type HeroProps = {
  content: SiteContent;
};

export function Hero({ content }: HeroProps) {
  return <HeroScroll content={content} />;
}
