import type { MenuItem } from "@/lib/content";

type SiteMenuProps = {
  items: MenuItem[];
};

export function MenuArrow() {
  return (
    <svg className="site-menu-arrow" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M3.5 12.5 12.5 3.5M12.5 3.5H6.2M12.5 3.5v6.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteMenu({ items }: SiteMenuProps) {
  return (
    <nav aria-label="Principal">
      <ul className="flex w-full flex-wrap items-center gap-x-8 gap-y-3 lg:justify-between">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="site-menu-link inline-flex items-center text-[0.95rem] font-medium tracking-[-0.015em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a0a0c] lg:text-[clamp(0.85rem,0.95vw,1rem)]"
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
  );
}
