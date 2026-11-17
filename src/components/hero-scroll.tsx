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
import { MenuArrow, SiteMenu } from "@/components/site-menu";
import type { SiteContent } from "@/lib/content";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        d="M7 17 17 7M17 7H9M17 7v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
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

export function HeroScroll({ content }: HeroScrollProps) {
  const { brand, menu, socials, projects } = content;
  const projectCount = Math.max(projects.length, 1);
  const classicLayout = projects.length === 3;
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>("hold");
  const menuOpenRef = useRef(false);
  const progressRef = useRef(0);

  const scrollToStage = useCallback(
    (stage: number) => {
      const track = trackRef.current;
      if (!track) return;
      const max = track.offsetHeight - window.innerHeight;
      const top = track.offsetTop + (max * stage) / projectCount;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [projectCount],
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
        stage.dataset.chrome = "off";
        return;
      }
      const max = track.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-track.getBoundingClientRect().top, 0), max);
      const progress = max > 0 ? (scrolled / max) * projectCount : 0;
      if (menuOpenRef.current && Math.abs(progress - progressRef.current) > 0.02) {
        menuOpenRef.current = false;
        setMenuOpen(false);
      }
      progressRef.current = progress;
      const intro = Math.min(progress, 1);
      stage.style.setProperty("--intro", intro.toFixed(4));
      stage.style.setProperty("--step", Math.max(progress - 1, 0).toFixed(4));
      stage.dataset.chrome = intro >= 0.92 ? "on" : "off";
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
  }, [bootPhase, projectCount]);

  return (
    <section
      ref={trackRef}
      id="top"
      className="hero-scroll relative"
      style={{ ["--project-count" as string]: projectCount }}
    >
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        aria-hidden
      >
        {Array.from({ length: projectCount + 1 }, (_, index) => (
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
          >
            <div className="flex h-auto flex-col lg:h-full lg:flex-row">
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

              <div className="projects-row flex flex-col">
                {projects.map((project, index) => (
                  <article
                    key={project.id}
                    className={`project relative h-[100dvh] overflow-hidden${classicLayout ? ` project-${index + 1}` : ""}`}
                    style={{ backgroundColor: project.color }}
                    aria-labelledby={`project-${project.id}`}
                  >
                    <div
                      className="project-photo"
                      style={{ backgroundColor: project.media }}
                    >
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.imageAlt}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          className="object-cover object-[center_42%]"
                        />
                      ) : null}
                    </div>

                    <div className="project-details absolute inset-x-0 top-[58%] bottom-0 lg:top-[64.9%]">
                      <div className="relative px-[1.35rem] pt-[1.4rem] lg:px-[1.7rem] lg:pt-[1.5rem]">
                        <span className="inline-flex rounded-full border border-[#1c1c1c] px-[0.9rem] py-[0.38rem] text-[0.78rem] leading-none tracking-[-0.01em]">
                          {project.year}
                        </span>
                        <p className="pointer-events-none absolute top-[1.85rem] left-1/2 -translate-x-1/2 text-[0.68rem] tracking-[0.14em] uppercase lg:top-[2rem]">
                          {project.tags[0]}
                        </p>
                        <p className="absolute top-[1.55rem] right-[1.35rem] max-w-[12.5rem] text-right text-[0.68rem] leading-[1.35] tracking-[0.12em] whitespace-pre-line uppercase lg:top-[1.65rem] lg:right-[1.7rem]">
                          {project.tags[1]}
                        </p>
                      </div>

                      <h2
                        id={`project-${project.id}`}
                        className="absolute inset-x-[1.35rem] top-[52%] -translate-y-1/2 text-center text-[clamp(2.8rem,4.9vw,4.55rem)] leading-none font-normal tracking-[-0.045em] lg:inset-x-[1.7rem]"
                      >
                        {project.title}
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          scrollToStage(Math.min(index + 2, projectCount))
                        }
                        className="project-arrow absolute right-[1.35rem] bottom-[1.7rem] flex size-[3.35rem] items-center justify-center rounded-full border border-[#1c1c1c] text-[#0a0a0c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3858E9] lg:right-[1.7rem] lg:bottom-[2rem]"
                        aria-label={`Voir le projet suivant après ${project.title}`}
                      >
                        <ArrowIcon />
                      </button>

                      <span className="pointer-events-none absolute bottom-[1.7rem] left-[1.35rem] text-[0.68rem] tracking-[0.16em] lg:bottom-[2rem] lg:left-[1.7rem]">
                        {project.id}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <a
              href="#top"
              className="brand-lockup absolute top-[1.55rem] left-[1.7rem] z-20 hidden font-display text-[1.15rem] leading-none tracking-[-0.04em] lg:block"
            >
              {brand.name}
            </a>

            <div className="menu-fab absolute top-[1.35rem] right-[1.5rem] z-30 hidden lg:block">
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
                <span className="menu-pill__label">Menu</span>
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
                  aria-label="Principal"
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
                            <span
                              className="site-menu-dot"
                              style={{ backgroundColor: item.color }}
                            >
                              <MenuArrow />
                            </span>
                          </span>
                          {item.label}
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
    </section>
  );
}
