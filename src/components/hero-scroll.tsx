"use client";

import Image from "next/image";
import Link from "next/link";
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
  closingCta,
  closingHeadline,
  closingLegal,
  expertiseImageAlt,
  expertiseItemServices,
  expertiseItemTitle,
  expertisesCta,
  expertisesTitle,
  listingBlurb,
  listingItemLabel,
  listingTitle,
  menuLabel,
  projectCta,
  projectImageAlt,
  projectPath,
  projectTags,
} from "@/lib/i18n";
import { armProjectBoot } from "@/lib/project-boot";

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

/* Active slide + two right peeks (vw). Next is smaller; next+1 much smaller.
 * Last slide expands to full width (no peeks left). */
const EXPERTISE_MAIN_VW = 78;
const EXPERTISE_PEEK1_VW = 14;
const EXPERTISE_PEEK2_VW = 8;

function expertiseSlotSizes(
  step: number,
  count: number,
): { main: number; peek1: number; peek2: number } {
  const remaining = Math.max(count - 1 - step, 0);

  if (remaining <= 0) {
    return { main: 100, peek1: 0, peek2: 0 };
  }
  if (remaining < 1) {
    const t = 1 - remaining;
    return {
      main: 86 + 14 * t,
      peek1: 14 * (1 - t),
      peek2: 0,
    };
  }
  if (remaining < 2) {
    const t = 2 - remaining;
    return {
      main: EXPERTISE_MAIN_VW + EXPERTISE_PEEK2_VW * t,
      peek1: EXPERTISE_PEEK1_VW,
      peek2: EXPERTISE_PEEK2_VW * (1 - t),
    };
  }
  return {
    main: EXPERTISE_MAIN_VW,
    peek1: EXPERTISE_PEEK1_VW,
    peek2: EXPERTISE_PEEK2_VW,
  };
}

function expertisePanelLayout(
  offset: number,
  main: number,
  peek1: number,
  peek2: number,
): { left: number; width: number } {
  if (offset <= -1) {
    return { left: offset * main, width: main };
  }
  if (offset < 0) {
    return { left: offset * main, width: main };
  }
  if (offset < 1) {
    return {
      left: offset * main,
      width: main + (peek1 - main) * offset,
    };
  }
  if (offset < 2) {
    const u = offset - 1;
    return {
      left: main + u * peek1,
      width: peek1 + (peek2 - peek1) * u,
    };
  }
  if (offset < 3) {
    const u = offset - 2;
    return {
      left: main + peek1 + u * peek2,
      width: peek2 * (1 - u),
    };
  }
  return { left: main + peek1 + peek2, width: 0 };
}

/* Pin each expertise slide at the left edge before the next scrub */
const EXPERTISE_HOLD_UNITS = 1;
/* Shorter move = incoming slide scrubs in faster */
const EXPERTISE_MOVE_UNITS = 0.45;

function expertiseStepFromLocal(local: number, count: number): number {
  if (count <= 1) return 0;
  let t = Math.max(local, 0);

  if (t < EXPERTISE_HOLD_UNITS) return 0;
  t -= EXPERTISE_HOLD_UNITS;

  for (let i = 0; i < count - 1; i += 1) {
    if (t < EXPERTISE_MOVE_UNITS) {
      return i + t / EXPERTISE_MOVE_UNITS;
    }
    t -= EXPERTISE_MOVE_UNITS;
    if (i === count - 2) return count - 1;
    if (t < EXPERTISE_HOLD_UNITS) return i + 1;
    t -= EXPERTISE_HOLD_UNITS;
  }

  return count - 1;
}

function expertiseUnitForIndex(index: number): number {
  return index * (EXPERTISE_HOLD_UNITS + EXPERTISE_MOVE_UNITS);
}

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
  brand,
}: {
  project: Project;
  index: number;
  featured: boolean;
  onNext: () => void;
  priority?: boolean;
  brand: { name: string; tagline: string };
}) {
  const { locale, copy } = useLocale();
  const tags = projectTags(project, locale);
  const imageAlt = projectImageAlt(project, locale);
  const href = projectPath(project);
  const openLabel = projectCta(project, locale);

  return (
    <article
      className={`project relative h-[100dvh] overflow-hidden${featured ? ` project-${index + 1}` : ""}`}
      style={{ backgroundColor: project.color }}
      aria-labelledby={`project-${project.id}`}
    >
      <Link
        href={href}
        className="project-photo"
        style={{ backgroundColor: project.media }}
        aria-label={`${openLabel}: ${project.title}`}
        onClick={() => armProjectBoot(brand)}
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
      </Link>

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
  const { brand, menu, socials, listing, projects, expertises, closing } =
    content;
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
  const listingUnits = hasListing ? 1 + stackScrollUnits : 0;
  const listingEndUnit = FEATURED_UNITS + listingUnits;

  const expertiseItems = expertises?.items ?? [];
  const expertiseCount = expertiseItems.length;
  const hasExpertises = expertiseCount > 0;
  const expertiseEnterUnits = hasExpertises ? 1 : 0;
  /* Hold on each slide, move between them, hold again on the last */
  const expertiseScrubUnits = hasExpertises
    ? EXPERTISE_HOLD_UNITS +
      Math.max(expertiseCount - 1, 0) *
        (EXPERTISE_MOVE_UNITS + EXPERTISE_HOLD_UNITS)
    : 0;
  const totalUnits =
    listingEndUnit + expertiseEnterUnits + expertiseScrubUnits;

  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLElement>(null);
  const closingMarkRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>("hold");
  const [activeListing, setActiveListing] = useState(0);
  const [activeExpertise, setActiveExpertise] = useState(0);
  const [closingMarkInView, setClosingMarkInView] = useState(false);
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
      if (bootPhase !== "done") {
        stage.style.setProperty("--intro", "0");
        stage.style.setProperty("--step", "0");
        stage.style.setProperty("--listing-morph", "0");
        stage.style.setProperty("--listing-step", "0");
        stage.style.setProperty("--expertise-enter", "0");
        stage.style.setProperty("--expertise-step", "0");
        stage.dataset.chrome = "off";
        stage.dataset.phase = "featured";
        if (chromeRef.current) chromeRef.current.dataset.visible = "false";
        document.documentElement.style.scrollSnapType = "";
        return;
      }

      if (!desktop.matches) {
        /* Mobile: fixed chrome stays up; no desktop scrub math */
        if (chromeRef.current) chromeRef.current.dataset.visible = "true";
        stage.dataset.chrome = "on";
        document.documentElement.style.scrollSnapType = "";
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
      /* Start sliding expertises in slightly before listing scroll maxes out */
      const expertiseEnter = hasExpertises
        ? Math.min(Math.max(progress - (listingEndUnit - 0.35), 0), 1)
        : 0;
      const expertiseStep = hasExpertises
        ? expertiseStepFromLocal(
            progress - (listingEndUnit + 1),
            expertiseCount,
          )
        : 0;

      stage.style.setProperty("--intro", intro.toFixed(4));
      stage.style.setProperty("--step", step.toFixed(4));
      stage.style.setProperty("--listing-morph", morph.toFixed(4));
      stage.style.setProperty("--listing-step", listingStep.toFixed(4));
      stage.style.setProperty("--expertise-enter", expertiseEnter.toFixed(4));
      stage.style.setProperty("--expertise-step", expertiseStep.toFixed(4));
      const chromeOn = intro >= 0.92;
      stage.dataset.chrome = chromeOn ? "on" : "off";
      if (chromeRef.current) {
        chromeRef.current.dataset.visible = chromeOn ? "true" : "false";
      }
      stage.dataset.phase =
        expertiseEnter > 0.15
          ? "expertise"
          : morph > 0.45
            ? "listing"
            : "featured";

      /* Snap fights the handoff past the projects CTA — free scroll for expertises */
      document.documentElement.style.scrollSnapType =
        expertiseEnter > 0.02 ? "none" : "";

      if (hasExpertises) {
        const enterOffset = (1 - expertiseEnter) * 100;
        /* Continuous bottom line: grows from specialties enter through last hold */
        const navStart = listingEndUnit - 0.35;
        const navEnd = listingEndUnit + 1 + expertiseScrubUnits;
        const navProgress =
          navEnd > navStart
            ? Math.min(Math.max((progress - navStart) / (navEnd - navStart), 0), 1)
            : 0;
        stage.style.setProperty("--nav-progress", navProgress.toFixed(4));
        const slots = expertiseSlotSizes(expertiseStep, expertiseCount);
        /* Image drifts left at ~18% panel speed; lag keeps it under the faster incoming bg */
        const mediaSpeed = 0.18;
        for (let i = 0; i < expertiseCount; i += 1) {
          const { left, width } = expertisePanelLayout(
            i - expertiseStep,
            slots.main,
            slots.peek1,
            slots.peek2,
          );
          stage.style.setProperty(
            `--ep-x-${i}`,
            `${(left + enterOffset).toFixed(3)}vw`,
          );
          stage.style.setProperty(`--ep-w-${i}`, `${width.toFixed(3)}vw`);

          const exit = Math.min(Math.max(expertiseStep - i, 0), 1);
          /* Positive lag = image sits right of panel edge → slower leftward in view */
          const mediaLag = exit * slots.main * (1 - mediaSpeed);
          stage.style.setProperty(
            `--media-lag-${i}`,
            `${mediaLag.toFixed(3)}vw`,
          );
        }
      }

      const nextActive = Math.min(
        Math.round(listingStep),
        Math.max(listingFrameCount - 1, 0),
      );
      setActiveListing((current) =>
        current === nextActive ? current : nextActive,
      );

      const nextExpertise = Math.min(
        Math.round(expertiseStep),
        Math.max(expertiseCount - 1, 0),
      );
      setActiveExpertise((current) =>
        current === nextExpertise ? current : nextExpertise,
      );
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desktop.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
      window.removeEventListener("resize", onScroll);
      desktop.removeEventListener("change", onScroll);
      document.documentElement.style.scrollSnapType = "";
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [
    bootPhase,
    expertiseCount,
    expertiseScrubUnits,
    hasExpertises,
    hasListing,
    listingEndUnit,
    listingFrameCount,
    stackScrollUnits,
    totalUnits,
  ]);

  useEffect(() => {
    const mark = closingMarkRef.current;
    if (!mark || !closing) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setClosingMarkInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35 },
    );
    observer.observe(mark);
    return () => observer.disconnect();
  }, [closing]);

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
  const expertisesTitleText = expertises
    ? expertisesTitle(expertises, locale)
    : "";
  const expertisesCtaText = expertises
    ? expertisesCta(expertises, locale)
    : "";
  const closingHeadlineText = closing
    ? closingHeadline(closing, locale)
    : "";
  const closingCtaText = closing ? closingCta(closing, locale) : "";
  const closingLegalText = closing ? closingLegal(closing, locale) : "";
  const closingLines = closingHeadlineText.split("\n").filter(Boolean);

  return (
    <>
    <header
      ref={chromeRef}
      className="site-chrome"
      data-visible="false"
      data-boot={bootPhase}
    >
      <div className="site-chrome__blend">
        <a href="#top" className="site-chrome__brand">
          {brand.name}
        </a>
        <div className="site-chrome__actions">
          <LanguageToggle className="site-chrome__lang" />
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
        </div>
      </div>
      {menuOpen ? (
        <nav
          id="site-menu-panel"
          aria-label={copy.menuAria}
          className="site-chrome__menu"
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
    </header>

    <section
      ref={trackRef}
      id="top"
      className="hero-scroll relative"
      style={{
        ["--project-count" as string]: String(totalUnits),
        ["--listing-count" as string]: String(stackCount),
        ["--expertise-count" as string]: String(Math.max(expertiseCount, 1)),
        /* Bake height so track always extends past projects CTA into expertises */
        height: `calc(100dvh + ${totalUnits} * 120dvh)`,
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
                    brand={brand}
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
                      brand={brand}
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
                      const href = projectPath(project);
                      const openLabel = projectCta(project, locale);

                      return (
                        <article
                          key={project.id}
                          className="listing-frame"
                          data-active={isActive ? "true" : "false"}
                          style={{ backgroundColor: project.color }}
                        >
                          <Link
                            href={href}
                            className="listing-frame__photo"
                            style={{ backgroundColor: project.media }}
                            aria-label={`${openLabel}: ${project.title}`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => armProjectBoot(brand)}
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
                          </Link>
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

            {hasExpertises && expertises ? (
              <div className="expertise-layer" id="especialidades">
                {/* Slides in with first panel, then stays pinned */}
                <h2 className="expertise-layer__title">{expertisesTitleText}</h2>

                {/* Fixed lower content — revealed by clip as each slide edge crosses */}
                <div className="expertise-copies">
                  {expertiseItems.map((item, index) => {
                    const itemTitle = expertiseItemTitle(item, locale);
                    const services = expertiseItemServices(item, locale);
                    const mid = Math.ceil(services.length / 2);

                    return (
                      <div
                        key={item.id}
                        className="expertise-copy"
                        style={{
                          ["--panel-i" as string]: index,
                          ["--panel-x" as string]: `var(--ep-x-${index})`,
                          ["--panel-w" as string]: `var(--ep-w-${index})`,
                        }}
                        aria-hidden={index !== activeExpertise}
                      >
                        <h3 className="expertise-panel__title">{itemTitle}</h3>
                        <div className="expertise-panel__services">
                          <ul>
                            {services.slice(0, mid).map((service) => (
                              <li key={service}>
                                <span aria-hidden>/ </span>
                                {service}
                              </li>
                            ))}
                          </ul>
                          <ul>
                            {services.slice(mid).map((service) => (
                              <li key={service}>
                                <span aria-hidden>/ </span>
                                {service}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <a
                          href={`#expertise-${item.id}`}
                          className="expertise-panel__cta"
                          tabIndex={index === activeExpertise ? 0 : -1}
                        >
                          <span>{expertisesCtaText}</span>
                          <span className="expertise-panel__cta-dot" aria-hidden />
                        </a>
                      </div>
                    );
                  })}
                </div>

                <div className="expertise-track">
                  {expertiseItems.map((item, index) => {
                    const imageAlt = expertiseImageAlt(item, locale);

                    return (
                      <article
                        key={item.id}
                        className="expertise-panel"
                        style={{
                          backgroundColor: item.color,
                          ["--panel-i" as string]: index,
                          ["--panel-x" as string]: `var(--ep-x-${index})`,
                          ["--panel-w" as string]: `var(--ep-w-${index})`,
                          ["--media-lag" as string]: `var(--media-lag-${index})`,
                        }}
                      >
                        <div className="expertise-panel__media">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={imageAlt}
                              fill
                              sizes="45vw"
                              className="expertise-panel__img object-cover object-center"
                            />
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <nav className="expertise-nav" aria-label={expertisesTitleText}>
                  <span className="expertise-nav__line" aria-hidden />
                  {expertiseItems.map((item, index) => {
                    const itemTitle = expertiseItemTitle(item, locale);
                    const isActive = index === activeExpertise;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="expertise-nav__item"
                        data-active={isActive ? "true" : "false"}
                        onClick={() =>
                          scrollToUnit(
                            listingEndUnit +
                              1 +
                              expertiseUnitForIndex(index),
                          )
                        }
                      >
                        <span className="expertise-nav__id">{item.id}</span>
                        <span className="expertise-nav__label-slot">
                          <span className="expertise-nav__label-clip">
                            <span className="expertise-nav__label">
                              {itemTitle}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ) : null}

            {/* Mobile expertises — stacked, no horizontal scrub */}
            {hasExpertises && expertises ? (
              <section className="expertise-mobile px-5 py-16 sm:px-8">
                <h2 className="text-[clamp(2.4rem,10vw,3.5rem)] tracking-[-0.04em]">
                  {expertisesTitleText}
                </h2>
                <div className="mt-12 flex flex-col gap-14">
                  {expertiseItems.map((item) => {
                    const itemTitle = expertiseItemTitle(item, locale);
                    const services = expertiseItemServices(item, locale);
                    const imageAlt = expertiseImageAlt(item, locale);
                    return (
                      <article
                        key={item.id}
                        id={`expertise-${item.id}`}
                        className="expertise-mobile__panel"
                      >
                        <div
                          className="expertise-mobile__media relative aspect-[4/3] overflow-hidden"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={imageAlt}
                              fill
                              sizes="100vw"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <p className="mt-5 text-sm tracking-[0.12em] uppercase opacity-50">
                          {item.id}
                        </p>
                        <h3 className="mt-2 text-[clamp(1.6rem,6vw,2.2rem)] tracking-[-0.03em]">
                          {itemTitle}
                        </h3>
                        <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {services.map((service) => (
                            <li
                              key={service}
                              className="text-[0.72rem] tracking-[0.08em] uppercase"
                            >
                              <span aria-hidden>/ </span>
                              {service}
                            </li>
                          ))}
                        </ul>
                        <a
                          href={`#expertise-${item.id}`}
                          className="expertise-panel__cta mt-8 inline-flex"
                        >
                          <span>{expertisesCtaText}</span>
                          <span className="expertise-panel__cta-dot" aria-hidden />
                        </a>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

          </div>
        </div>
      </div>
    </section>

    {closing ? (
      <section
        id="contacto"
        className="closing-section"
        aria-label={closingCtaText}
      >
        <div className="closing-section__main">
          <h2 className="closing-section__headline">
            {closingLines.map((line) => (
              <span key={line} className="closing-section__line">
                {line}
              </span>
            ))}
          </h2>
          <a href={closing.ctaHref} className="closing-section__cta">
            <span>{closingCtaText}</span>
            <span className="closing-section__cta-dot" aria-hidden />
          </a>
        </div>

        <footer className="closing-section__footer">
          <div className="closing-section__col">
            {closing.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="closing-section__col">
            {closing.emails.map((email) => (
              <a key={email} href={`mailto:${email}`}>
                {email}
              </a>
            ))}
            {closing.phone ? (
              <a href={`tel:${closing.phone.replace(/\s+/g, "")}`}>
                {closing.phone}
              </a>
            ) : null}
          </div>
          <div className="closing-section__col">
            {socials.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="closing-section__col closing-section__col--end">
            <a href={closing.legalHref}>{closingLegalText}</a>
            <p>{closing.copyright}</p>
          </div>
        </footer>

        <div
          ref={closingMarkRef}
          className="closing-section__mark"
          data-inview={closingMarkInView ? "true" : "false"}
        >
          <div className="closing-section__mark-clip">
            <BrandWordmark
              tone="white"
              name={brand.name}
              className="closing-section__mark-img"
            />
          </div>
        </div>
      </section>
    ) : null}
    </>
  );
}
