import { Hero } from "@/components/hero";
import { getSiteContent } from "@/lib/content";

export default async function Home() {
  const content = await getSiteContent();
  return <Hero content={content} />;
}
