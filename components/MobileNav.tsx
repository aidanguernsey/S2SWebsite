"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Social = { href: string; label: string };

const icon = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const tabs = [
  {
    href: "/",
    label: "Home",
    active: (p: string) => p === "/",
    svg: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    href: "/music",
    label: "Music",
    active: (p: string) => p.startsWith("/music"),
    svg: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  },
  {
    href: "/events",
    label: "Events",
    active: (p: string) => p.startsWith("/events"),
    svg: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
  },
  {
    href: "/members",
    label: "Members",
    active: (p: string) => p.startsWith("/members") || p.startsWith("/alumni"),
    svg: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.7 3.5 6" />
      </>
    ),
  },
];

const morePages = [
  {
    href: "/about",
    label: "About",
    sub: "Our history",
    svg: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.5" />
      </>
    ),
  },
  {
    href: "/shop",
    label: "Shop",
    sub: "Merch and albums",
    svg: (
      <>
        <path d="M6 7h12l-1 13H7z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </>
    ),
  },
];

// Phone-only bottom tab bar and its "More" sheet (About, Shop, socials).
// Hidden on desktop by CSS, where the header nav does this job.
export function MobileNav({ socials, contactEmail }: { socials: Social[]; contactEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Close the sheet whenever the page changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
    moreButton.current?.focus();
  }

  const moreActive = open || morePages.some((p) => pathname.startsWith(p.href));

  return (
    <>
      {open && (
        <>
          <div className="more-backdrop" aria-hidden="true" onClick={close} />
          <div
            className="more-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-sheet-title"
            onTouchStart={(e) => (touchStartY.current = e.touches[0].clientY)}
            onTouchEnd={(e) => {
              // Swipe down to dismiss.
              if (touchStartY.current !== null && e.changedTouches[0].clientY - touchStartY.current > 60) close();
              touchStartY.current = null;
            }}
          >
            <div className="more-grabber" aria-hidden="true" />
            <div className="more-head">
              <h2 id="more-sheet-title">More</h2>
              <button ref={closeButton} type="button" className="more-close" onClick={close} aria-label="Close">
                <svg {...icon} width={18} height={18}>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="More pages" className="more-pages">
              {morePages.map((p) => (
                <Link key={p.href} href={p.href}>
                  <span className="more-icon">
                    <svg {...icon} width={20} height={20}>
                      {p.svg}
                    </svg>
                  </span>
                  <span className="more-label">
                    <strong>{p.label}</strong>
                    <span>{p.sub}</span>
                  </span>
                  <svg {...icon} width={18} height={18}>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </nav>
            {socials.length > 0 && (
              <>
                <div className="eyebrow more-eyebrow">Follow us</div>
                <div className="more-socials">
                  {socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  ))}
                </div>
              </>
            )}
            <a className="more-email" href={`mailto:${contactEmail}`}>
              Email us · {contactEmail}
            </a>
          </div>
        </>
      )}

      <nav className="tabbar" aria-label="Main">
        {tabs.map((t) => {
          const active = !open && t.active(pathname);
          return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}>
              <svg {...icon}>{t.svg}</svg>
              {t.label}
            </Link>
          );
        })}
        <button
          ref={moreButton}
          type="button"
          className={moreActive ? "is-active" : undefined}
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <svg {...icon}>
            <circle cx="5" cy="12" r="1.2" />
            <circle cx="12" cy="12" r="1.2" />
            <circle cx="19" cy="12" r="1.2" />
          </svg>
          More
        </button>
      </nav>
    </>
  );
}
