const OVERLAY_ID = "project-boot-overlay";

function taglineMarkup(tagline: string) {
  return tagline
    .split("")
    .map((char, index) => {
      const safe = char === " " ? "&nbsp;" : char;
      const hidden = char === " " ? ' aria-hidden="true"' : "";
      return `<span${hidden}>${safe}</span>`;
    })
    .join("");
}

/** Instant home-style splash (black + logo + blue tagline) before project navigation */
export function armProjectBoot(brand: { name: string; tagline: string }) {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.dataset.booting = "true";
  document.documentElement.dataset.projectBoot = "true";

  let overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.className = "project-boot-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="boot-splash__brand @container">
      <img
        class="boot-splash__logo"
        src="/brand/las-flores-wordmark-white.svg"
        alt="${brand.name.replace(/"/g, "&quot;")}"
        width="1024"
        height="385"
      />
      <p
        class="boot-splash__tagline creative-co flex justify-between font-thin text-[clamp(2rem,8.6cqw,3.85rem)] leading-none text-[#3858E9] uppercase"
        aria-label="${brand.tagline.replace(/"/g, "&quot;")}"
      >${taglineMarkup(brand.tagline)}</p>
    </div>
  `;

  /* Retrigger the same entrance animation as the home splash */
  const brandEl = overlay.querySelector(".boot-splash__brand");
  if (brandEl instanceof HTMLElement) {
    brandEl.style.animation = "none";
    void brandEl.offsetWidth;
    brandEl.style.animation = "";
  }
}

export function clearProjectBootOverlay() {
  if (typeof document === "undefined") return;
  document.getElementById(OVERLAY_ID)?.remove();
}
