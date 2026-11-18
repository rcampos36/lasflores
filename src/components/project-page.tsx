"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand-wordmark";
import { LanguageToggle } from "@/components/language-toggle";
import { LocaleProvider, useLocale } from "@/components/locale-provider";
import { MenuArrow, SiteMenu } from "@/components/site-menu";
import type { Project, SiteContent } from "@/lib/content";
import {
  menuLabel,
  projectCta,
  projectImageAlt,
  projectTags,
} from "@/lib/i18n";
import { clearProjectBootOverlay } from "@/lib/project-boot";

type BootPhase = "hold" | "exit" | "done";

/* Match home splash timing */
const BOOT_HOLD_MS = 2200;
const BOOT_EXIT_MS = 1400;

type ProjectPageProps = {
  content: SiteContent;
  project: Project;
};

export function ProjectPage({ content, project }: ProjectPageProps) {
  return (
    <LocaleProvider>
      <ProjectPageInner content={content} project={project} />
    </LocaleProvider>
  );
}

function ProjectPageInner({ content, project }: ProjectPageProps) {
  const { brand, menu, listing } = content;
  const { locale, copy } = useLocale();
  const [bootPhase, setBootPhase] = useState<BootPhase>("hold");
  const [menuOpen, setMenuOpen] = useState(false);
  const tags = projectTags(project, locale);
  const imageAlt = projectImageAlt(project, locale);
  const ctaLabel = projectCta(project, locale);
  const ctaHref = project.ctaHref?.trim() || "#";
  const listingLabel = locale === "en" ? listing.titleEn : listing.title;

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setBootPhase("done");
      clearProjectBootOverlay();
      delete document.documentElement.dataset.booting;
      delete document.documentElement.dataset.projectBoot;
      return;
    }

    document.documentElement.dataset.booting = "true";
    document.documentElement.dataset.projectBoot = "true";
    window.scrollTo(0, 0);

    /* Keep the click splash through the hold, then reveal the project sheet */
    const exitTimer = window.setTimeout(() => {
      clearProjectBootOverlay();
      setBootPhase("exit");
    }, BOOT_HOLD_MS);
    const doneTimer = window.setTimeout(() => {
      setBootPhase("done");
      clearProjectBootOverlay();
      delete document.documentElement.dataset.booting;
      delete document.documentElement.dataset.projectBoot;
    }, BOOT_HOLD_MS + BOOT_EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      clearProjectBootOverlay();
      delete document.documentElement.dataset.booting;
      delete document.documentElement.dataset.projectBoot;
    };
  }, []);

  useEffect(() => {
    if (bootPhase === "done") {
      clearProjectBootOverlay();
      delete document.documentElement.dataset.booting;
      delete document.documentElement.dataset.projectBoot;
    }
  }, [bootPhase]);

  return (
    <div
      className="project-page"
      data-boot={bootPhase}
      style={{ ["--project-bg" as string]: project.color }}
    >
      <div
        className="project-page__boot"
        aria-hidden={bootPhase === "done"}
      >
        <div className="@container boot-splash__brand">
          <BrandWordmark
            tone="white"
            name={brand.name}
            className="boot-splash__logo"
            priority
          />
          <p
            className="boot-splash__tagline creative-co flex justify-between font-thin text-[clamp(2rem,8.6cqw,3.85rem)] leading-none text-[#3858E9] uppercase"
            aria-label={brand.tagline}
          >
            {brand.tagline.split("").map((char, index) => (
              <span
                key={`project-splash-${char}-${index}`}
                aria-hidden={char === " "}
              >
                {char === " " ? "\u00a0" : char}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="project-page__sheet">
        <header className="project-page__chrome">
          <Link href="/#top" className="project-page__brand">
            {brand.name}
          </Link>

          <p className="project-page__crumb">
            <Link href="/#proyectos">{listingLabel}</Link>
            <span className="project-page__crumb-dot" aria-hidden />
            <span>{project.title}</span>
          </p>

          <div className="project-page__actions">
            <LanguageToggle className="project-page__lang hidden sm:inline-flex" />
            <div className="relative">
              <button
                type="button"
                className="menu-pill"
                aria-expanded={menuOpen}
                aria-controls="project-menu-panel"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="menu-pill__label">{copy.menu}</span>
                <span className="menu-pill__cluster" aria-hidden>
                  <span className="menu-pill__grow" />
                  <span className="menu-pill__orb-slot">
                    <span className="menu-pill__orb">
                      <span className="menu-pill__burger">
                        <span />
                        <span />
                      </span>
                    </span>
                  </span>
                </span>
              </button>
              {menuOpen ? (
                <nav
                  id="project-menu-panel"
                  aria-label={copy.menuAria}
                  className="absolute top-[calc(100%+0.75rem)] right-0 z-20 w-56 rounded-2xl bg-[#f0efeb] p-3 text-[#0a0a0c] shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
                >
                  <ul className="flex flex-col">
                    <li>
                      <Link
                        href="/"
                        className="site-menu-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] hover:bg-black/5"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="site-menu-dot-slot" aria-hidden>
                          <span className="site-menu-dot bg-[#3858E9]">
                            <MenuArrow />
                          </span>
                        </span>
                        Home
                      </Link>
                    </li>
                    {menu.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href.startsWith("#") ? `/${item.href}` : item.href}
                          className="site-menu-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] hover:bg-black/5"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="site-menu-dot-slot" aria-hidden>
                            <span
                              className="site-menu-dot"
                              style={{ backgroundColor: item.color }}
                            >
                              <MenuArrow />
                            </span>
                          </span>
                          {menuLabel(item, locale)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
          </div>
        </header>

        <div className="project-page__mobile-menu lg:hidden">
          <SiteMenu
            items={menu.map((item) => ({
              ...item,
              href: item.href.startsWith("#") ? `/${item.href}` : item.href,
            }))}
          />
        </div>

        <main className="project-page__main">
          <div className="project-page__intro">
            <h1 className="project-page__title">{project.title}</h1>
            <a href={ctaHref} className="project-page__cta">
              <span>{ctaLabel}</span>
              <span className="project-page__cta-dot" aria-hidden />
            </a>
          </div>

          <div className="project-page__rule" aria-hidden />

          <div className="project-page__meta">
            <p className="project-page__summary">{tags[1]}</p>
            <p className="project-page__category">{tags[0]}</p>
            <span className="project-page__year">{project.year}</span>
          </div>

          <div
            className="project-page__media"
            style={{ backgroundColor: project.media }}
          >
            {project.image ? (
              <Image
                src={project.image}
                alt={imageAlt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
