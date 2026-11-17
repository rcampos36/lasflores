"use client";

import { useLocale } from "@/components/locale-provider";

type LanguageToggleProps = {
  className?: string;
};

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { locale, setLocale, copy } = useLocale();

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.16em] uppercase ${className}`.trim()}
      role="group"
      aria-label={copy.toggleLabel}
    >
      <button
        type="button"
        className={`transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3858E9] ${
          locale === "es" ? "text-[#3858E9] opacity-100" : "opacity-35 hover:opacity-70"
        }`}
        aria-pressed={locale === "es"}
        onClick={() => setLocale("es")}
      >
        ES
      </button>
      <span className="opacity-25" aria-hidden>
        /
      </span>
      <button
        type="button"
        className={`transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3858E9] ${
          locale === "en" ? "text-[#3858E9] opacity-100" : "opacity-35 hover:opacity-70"
        }`}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
