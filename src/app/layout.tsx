import type { Metadata } from "next";
import { Anton, Geist } from "next/font/google";
import Script from "next/script";
import { getSiteContent } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  const content = await getSiteContent();
  return {
    title: content.brand.title,
    description: content.brand.description,
  };
}

const bootSplashScript = `
(function () {
  try {
    var path = window.location.pathname;
    if (path !== "/" && path !== "") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.dataset.booting = "true";
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f0efeb] font-sans text-[#0a0a0c]">
        <Script id="boot-splash" strategy="beforeInteractive">
          {bootSplashScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
