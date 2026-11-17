"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BrandWordmark } from "@/components/brand-wordmark";
import { LanguageToggle } from "@/components/language-toggle";
import { LocaleProvider, useLocale } from "@/components/locale-provider";
import { MenuArrow, SiteMenu } from "@/components/site-menu";
import type { Project, SiteContent } from "@/lib/content";
import {
  listingBlurb,
  listingItemLabel,
  listingTitle,
  menuLabel,
  projectImageAlt,
  projectTags,
} from "@/lib/i18n";

function ArrowIcon() {
  return (
    <svg className="project-arrow__svg" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 17 17 7M17 7H9M17 7v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HeroScrollProps = {
  content: SiteContent;
};

type BootPhase = "hold" | "exit" | "done";

const BOOT_HOLD_MS = 2200;
const BOOT_EXIT_MS = 1400;
const BOOT_STAGGER_TAIL_MS = 1100;
const FEATURED_COUNT = 3;
/** Intro (1) + featured end state (2 steps → 3 panels) = 3 units before morph */
const FEATURED_UNITS = 3;

export function HeroScroll({ content }: HeroScrollProps) {
  return (
    <LocaleProvider>
      <HeroScrollInner content={content} />
    </LocaleProvider>
  );
}

function ProjectCard({
  project,
  index,
  featured,
  onNext,
  priority,
}: {
  project: Project;
  index: number;
  featured: boolean;
  onNext: () => void;
  priority?: boolean;
}) {
  const { locale, copy } = useLocale();
  const tags = projectTags(project, locale);
  const imageAlt = projectImageAlt(project, locale);

  return (
    <article
      className={`project relative h-[100dvh] overflow-hidden${featured ? ` project-${index + 1}` : ""}`}
      style={{ backgroundColor: project.color }}
      aria-labelledby={`project-${project.id}`}
    >
      <button
        type="button"
        className="project-photo"
        style={{ backgroundColor: project.media }}
        onClick={onNext}
        aria-label={copy.nextProject(project.title)}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="pointer-events-none object-cover object-[center_42%]"
          />
        ) : null}
      </button>

      <div className="project-details absolute inset-x-0 top-[58%] bottom-0 lg:top-[64.9%]">
        <div className="project-meta relative mx-[1.35rem] mt-[1.4rem] lg:mx-[1.7rem] lg:mt-[1.5rem]">
          <div className="project-clip project-clip--year">
            <span
              className="project-rise project-rise--meta inline-flex rounded-full border border-[#1c1c1c] px-[0.9rem] py-[0.38rem] text-[0.78rem] leading-none tracking-[-0.01em]"
              style={{ ["--rise-i" as string]: 0 }}
            >
              {project.year}
            </span>
          </div>
          <div className="project-clip project-clip--tag-mid">
            <p
              className="project-rise project-rise--meta project-rise--center text-[0.68rem] tracking-[0.14em] uppercase"
              style={{ ["--rise-i" as string]: 1 }}
            >
              {tags[0]}
            </p>
          </div>
          <div className="project-clip project-clip--tag-end">
            <p
              className="project-rise project-rise--meta text-right text-[0.68rem] leading-[1.35] tracking-[0.12em] whitespace-pre-line uppercase"
              style={{ ["--rise-i" as string]: 2 }}
            >
              {tags[1]}
            </p>
          </div>
        </div>

        <div className="project-title-clip absolute inset-x-[1.1rem] top-[52%] lg:inset-x-[1.4rem]">
          <h2
            id={`project-${project.id}`}
            className="project-title text-center font-normal tracking-[-0.05em]"
            aria-label={project.title}
          >
            {project.title.split("").map((char, letterIndex) => (
              <span
                key={`${project.id}-letter-${letterIndex}`}
                className="project-rise project-title-char inline-block"
                style={{
                  ["--rise-i" as string]: letterIndex,
                  ["--letter-count" as string]: project.title.length,
                }}
                aria-hidden
              >
                {char === " " ? "\u00a0" : char}
              </span>
            ))}
          </h2>
        </div>

        <div className="project-clip project-clip--arrow absolute right-[1.35rem] bottom-[1.7rem] lg:right-[1.7rem] lg:bottom-[2rem]">
          <button
            type="button"
            className="project-arrow project-rise"
            style={{ ["--rise-i" as string]: 0 }}
            onClick={onNext}
            aria-label={copy.nextProject(project.title)}
          >
            <span className="project-arrow__fill" aria-hidden />
            <span className="project-arrow__icon" aria-hidden>
              <ArrowIcon />
            </span>
          </button>
        </div>

        <span
          className="project-rise project-index pointer-events-none absolute bottom-[1.7rem] left-[1.35rem] text-[0.68rem] tracking-[0.16em] lg:bottom-[2rem] lg:left-[1.7rem]"
          style={{ ["--rise-i" as string]: 2 }}
        >
          {project.id}
        </span>
      </div>
    </article>
  );
}

function HeroScrollInner({ content }: HeroScrollProps) {
  const { brand, menu, socials, listing, projects } = content;
  const { locale, copy } = useLocale();

  const featuredProjects = projects.slice(0, FEATURED_COUNT);
  /** Morph keeps project 3, then only the 7 newer projects (never 1–2) */
  const listingOnlyProjects = projects.slice(FEATURED_COUNT);
  const stackProjects = [
    ...(featuredProjects[FEATURED_COUNT - 1]
      ? [featuredProjects[FEATURED_COUNT - 1]]
      : []),
    ...listingOnlyProjects,
  ];
  const mobileExtraProjects = listingOnlyProjects;
  const stackCount = stackProjects.length;
  /** Project strips + final CTA panel */
  const listingFrameCount = stackCount + (stackCount > 1 ? 1 : 0);
  const hasListing = stackCount > 1;
  const classicLayout = featuredProjects.length === FEATURED_COUNT;
  /**
   * After morph: scrub until the last two project strips + CTA fill the
   * column (CTA in the bottom third — scroll end).
   */
  const stackScrollUnits = Math.max(stackCount - 2, 0);
  const totalUnits =
    FEATURED_UNITS + (hasListing ? 1 + stackScrollUnits : 0);

  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>("hold");
  const [activeListing, setActiveListing] = useState(0);
  const menuOpenRef = useRef(false);
  const progressRef = useRef(0);

  const scrollToUnit = useCallback(
    (unit: number) => {
      const track = trackRef.current;
      if (!track) return;
      const max = track.offsetHeight - window.innerHeight;
      const top = track.offsetTop + (max * unit) / Math.max(totalUnits, 1);
      window.scrollTo({ top, behavior: "smooth" });
    },
    [totalUnits],
  );

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setBootPhase("done");
      delete document.documentElement.dataset.booting;
      return;
    }

    document.documentElement.dataset.booting = "true";
    window.scrollTo(0, 0);

    const exitTimer = window.setTimeout(() => setBootPhase("exit"), BOOT_HOLD_MS);
    const doneTimer = window.setTimeout(
      () => setBootPhase("done"),
      BOOT_HOLD_MS + BOOT_EXIT_MS + BOOT_STAGGER_TAIL_MS,
    );

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      delete document.documentElement.dataset.booting;
    };
  }, []);

  useLayoutEffect(() => {
    if (bootPhase === "done") {
      delete document.documentElement.dataset.booting;
    } else if (bootPhase === "hold" || bootPhase === "exit") {
      document.documentElement.dataset.booting = "true";
    }
  }, [bootPhase]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const desktop = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!desktop.matches || bootPhase !== "done") {
        stage.style.setProperty("--intro", "0");
        stage.style.setProperty("--step", "0");
        stage.style.setProperty("--listing-morph", "0");
        stage.style.setProperty("--listing-step", "0");
        stage.dataset.chrome = "off";
        stage.dataset.phase = "featured";
        return;
      }

      const max = track.offsetHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(-track.getBoundingClientRect().top, 0),
        max,
      );
      const progress = max > 0 ? (scrolled / max) * totalUnits : 0;

      if (
        menuOpenRef.current &&
        Math.abs(progress - progressRef.current) > 0.02
      ) {
        menuOpenRef.current = false;
        setMenuOpen(false);
      }
      progressRef.current = progress;

      const intro = Math.min(progress, 1);
      const step = Math.min(Math.max(progress - 1, 0), 2);
      const morph = hasListing
        ? Math.min(Math.max(progress - FEATURED_UNITS, 0), 1)
        : 0;
      const listingStep = hasListing
        ? Math.min(
            Math.max(progress - (FEATURED_UNITS + 1), 0),
            stackScrollUnits,
          )
        : 0;

      stage.style.setProperty("--intro", intro.toFixed(4));
      stage.style.setProperty("--step", step.toFixed(4));
      stage.style.setProperty("--listing-morph", morph.toFixed(4));
      stage.style.setProperty("--listing-step", listingStep.toFixed(4));
      stage.dataset.chrome = intro >= 0.92 ? "on" : "off";
      stage.dataset.phase = morph > 0.45 ? "listing" : "featured";

      const nextActive = Math.min(
        Math.round(listingStep),
        Math.max(listingFrameCount - 1, 0),
      );
      setActiveListing((current) =>
        current === nextActive ? current : nextActive,
      );
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desktop.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [
    bootPhase,
    hasListing,
    listingFrameCount,
    stackScrollUnits,
    totalUnits,
  ]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || bootPhase !== "done") return;

    const mobile = window.matchMedia("(max-width: 1023px)");
    const cards = stage.querySelectorAll<HTMLElement>(".project");

    if (!mobile.matches) {
      cards.forEach((project) => {
        project.dataset.inview = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.inview = "true";
          }
        }
      },
      { threshold: 0.35 },
    );

    cards.forEach((project) => observer.observe(project));
    return () => observer.disconnect();
  }, [bootPhase, projects.length]);

  const listingTitleText = listingTitle(listing, locale);
  const listingBlurbText = listingBlurb(listing, locale);

  return (
    <section
      ref={trackRef}
      id="top"
      className="hero-scroll relative"
      style={{
        ["--project-count" as string]: totalUnits,
        ["--listing-count" as string]: stackCount,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        aria-hidden
      >
        {Array.from({ length: totalUnits + 1 }, (_, index) => (
          <div
            key={index}
            className="snap-start absolute inset-x-0 h-px"
            style={{ top: `calc(${index} * var(--stage))` }}
          />
        ))}
      </div>

      <div className="boot-rail" data-phase={bootPhase}>
        {bootPhase !== "done" ? (
          <div className="boot-splash" aria-hidden={bootPhase !== "hold"}>
            <div className="@container boot-splash__brand">
              <BrandWordmark
                className="boot-splash__logo"
                tone="white"
                name={brand.name}
                priority
              />
              <p
                className="boot-splash__tagline creative-co flex justify-between font-thin text-[clamp(2rem,8.6cqw,3.85rem)] leading-none text-[#3858E9] uppercase"
                aria-label={brand.tagline}
              >
                {brand.tagline.split("").map((char, index) => (
                  <span
                    key={`splash-${char}-${index}`}
                    aria-hidden={char === " "}
                  >
                    {char === " " ? "\u00a0" : char}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ) : null}

        <div className="boot-home">
          <div
            ref={stageRef}
            className="hero-stage relative h-auto"
            data-boot={bootPhase}
            data-layout={classicLayout ? "classic" : "simple"}
            data-phase="featured"
          >
            <div className="featured-layer flex h-auto flex-col lg:h-full lg:flex-row">
              <div className="intro-clip">
                <div className="@container intro-inner relative flex min-h-dvh flex-col px-5 pt-6 pb-5 sm:px-8 lg:h-full lg:min-h-0 lg:px-[1.9vw] lg:pt-[2.4vh] lg:pb-[2.1vh]">
                  <SiteMenu items={menu} />
                  <div className="brand-wordmark-block absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 sm:px-8 lg:px-[1.9vw]">
                    <h1 className="m-0">
                      <BrandWordmark
                        tone="black"
                        name={brand.name}
                        priority
                      />
                    </h1>
                    <p
                      className="creative-co mt-[0.9rem] flex justify-between font-thin text-[clamp(2rem,8.6cqw,3.85rem)] leading-none text-[#3858E9] uppercase lg:mt-[1.15vh]"
                      aria-label={brand.tagline}
                    >
                      {brand.tagline.split("").map((char, index) => (
                        <span
                          key={`${char}-${index}`}
                          aria-hidden={char === " "}
                        >
                          {char === " " ? "\u00a0" : char}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div className="mt-auto border-t border-[#1a1916] pt-4 lg:pt-[1.5vh]">
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                      {socials.map((item) => (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            className="text-[0.68rem] tracking-[0.16em] text-[#3858E9] uppercase transition-opacity hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3858E9]"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div id="proyectos" className="projects-row flex flex-col">
                {featuredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    featured={classicLayout}
                    priority={index === 0}
                    onNext={() =>
                      scrollToUnit(
                        Math.min(
                          index + 2,
                          hasListing ? FEATURED_UNITS + 1 : FEATURED_UNITS,
                        ),
                      )
                    }
                  />
                ))}

                {/* Mobile-only: projects after the featured three */}
                {mobileExtraProjects.map((project, index) => (
                  <div key={project.id} className="lg:hidden">
                    <ProjectCard
                      project={project}
                      index={index}
                      featured={false}
                      onNext={() => {
                        const next =
                          mobileExtraProjects[
                            Math.min(index + 1, mobileExtraProjects.length - 1)
                          ];
                        const el = document.getElementById(
                          `listing-mobile-${next?.id}`,
                        );
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                    />
                    <div id={`listing-mobile-${project.id}`} />
                  </div>
                ))}

                {hasListing ? (
                  <div className="listing-cta listing-cta--mobile lg:hidden">
                    <a href="#proyectos" className="listing-cta__button">
                      <span>{copy.viewProjects}</span>
                      <span className="listing-cta__dot" aria-hidden />
                    </a>
                  </div>
                ) : null}
              </div>
            </div>

            {hasListing ? (
              <div className="listing-layer">
                <div className="listing-stack">
                  <div className="listing-stack__track">
                    {stackProjects.map((project, index) => {
                      const tags = projectTags(project, locale);
                      const imageAlt = projectImageAlt(project, locale);
                      const isActive = index === activeListing;

                      return (
                        <article
                          key={project.id}
                          className="listing-frame"
                          data-active={isActive ? "true" : "false"}
                          style={{ backgroundColor: project.color }}
                        >
                          <button
                            type="button"
                            className="listing-frame__photo"
                            style={{ backgroundColor: project.media }}
                            onClick={() =>
                              scrollToUnit(
                                FEATURED_UNITS +
                                  1 +
                                  Math.min(index, stackScrollUnits),
                              )
                            }
                            aria-label={copy.nextProject(project.title)}
                            tabIndex={isActive ? 0 : -1}
                          >
                            {project.image ? (
                              <Image
                                src={project.image}
                                alt={imageAlt}
                                fill
                                sizes="40vw"
                                className="pointer-events-none object-cover object-center"
                              />
                            ) : null}
                            <div className="listing-frame__chrome">
                              <div className="listing-frame__meta">
                                <span className="listing-frame__clip listing-frame__clip--top">
                                  <span className="listing-frame__rise listing-frame__rise--top listing-frame__tag">
                                    {tags[0]}
                                  </span>
                                </span>
                                <span className="listing-frame__clip listing-frame__clip--top">
                                  <span className="listing-frame__rise listing-frame__rise--top listing-frame__year">
                                    {project.year}
                                  </span>
                                </span>
                              </div>
                              <span className="listing-frame__clip listing-frame__clip--title">
                                <h3 className="listing-frame__rise listing-frame__rise--bottom listing-frame__title">
                                  {project.title}
                                </h3>
                              </span>
                              <span
                                className="listing-frame__clip listing-frame__clip--arrow"
                                aria-hidden
                              >
                                <span className="listing-frame__rise listing-frame__rise--bottom listing-frame__arrow">
                                  <span className="project-arrow listing-frame__circle">
                                    <span className="project-arrow__fill" />
                                    <span className="project-arrow__icon">
                                      <ArrowIcon />
                                    </span>
                                  </span>
                                </span>
                              </span>
                            </div>
                          </button>
                        </article>
                      );
                    })}

                    <div
                      className="listing-frame listing-cta"
                      data-active={
                        activeListing === stackCount ? "true" : "false"
                      }
                    >
                      <a href="#proyectos" className="listing-cta__button">
                        <span>{copy.viewProjects}</span>
                        <span className="listing-cta__dot" aria-hidden />
                      </a>
                    </div>
                  </div>
                </div>

                <aside className="listing-rail">
                  <h2 className="listing-rail__title">{listingTitleText}</h2>
                  <ul className="listing-rail__list">
                    {listing.items.map((item) => (
                      <li key={item.id} className="listing-rail__item">
                        <span className="listing-rail__id">{item.id}</span>
                        <span className="listing-rail__label">
                          {listingItemLabel(item, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="listing-rail__blurb">{listingBlurbText}</p>
                </aside>
              </div>
            ) : null}

            {/* Mobile listing rail after all projects */}
            {hasListing ? (
              <section className="listing-rail-mobile px-5 py-16 sm:px-8 lg:hidden">
                <h2 className="text-[clamp(2.4rem,10vw,3.5rem)] tracking-[-0.04em]">
                  {listingTitleText}
                </h2>
                <ul className="mt-10 flex flex-col">
                  {listing.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-4 border-t border-black/15 py-4"
                    >
                      <span className="w-8 text-sm opacity-50">{item.id}</span>
                      <span className="text-sm tracking-[0.06em] uppercase">
                        {listingItemLabel(item, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-10 max-w-xl text-[1.05rem] leading-relaxed opacity-80">
                  {listingBlurbText}
                </p>
              </section>
            ) : null}

            <a
              href="#top"
              className="brand-lockup absolute top-[1.55rem] left-[1.7rem] z-20 hidden font-display text-[1.15rem] leading-none tracking-[-0.04em] lg:block"
            >
              {brand.name}
            </a>

            <div className="menu-fab absolute top-[1.35rem] right-[1.5rem] z-30 hidden items-center gap-4 lg:flex">
              <LanguageToggle />
              <div className="relative">
                <button
                  type="button"
                  className="menu-pill"
                  aria-expanded={menuOpen}
                  aria-controls="site-menu-panel"
                  onClick={() => {
                    setMenuOpen((open) => {
                      menuOpenRef.current = !open;
                      return !open;
                    });
                  }}
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
                    id="site-menu-panel"
                    aria-label={copy.menuAria}
                    className="absolute top-[calc(100%+0.75rem)] right-0 w-56 rounded-2xl bg-[#f0efeb] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
                  >
                    <ul className="flex flex-col">
                      {menu.map((item) => (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            className="site-menu-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] hover:bg-black/5"
                            onClick={() => {
                              menuOpenRef.current = false;
                              setMenuOpen(false);
                            }}
                          >
                            <span className="site-menu-dot-slot" aria-hidden>
                              <span className="site-menu-dot bg-[#3858E9]">
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
          </div>
        </div>
      </div>
    </section>
  );
}
