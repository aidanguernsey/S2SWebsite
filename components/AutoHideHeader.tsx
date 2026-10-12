"use client";

import { useEffect, useRef, useState } from "react";

// Phone-only (see "Phone layout" in globals.css): the header slides away while you
// scroll down and comes back after a short scroll up. On desktop it never hides.
const PHONE = "(max-width: 720px)";
const ALWAYS_SHOWN_ABOVE = 64; // px from the top of the page
const REVEAL_AFTER = 24; // px of upward scrolling before it comes back

export function AutoHideHeader({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef<HTMLElement>(null);

  // How much of the top of the screen the header covers right now, for things pinned
  // below it (e.g. the Music page's release headers): its height, or 0 while hidden.
  useEffect(() => {
    const update = () =>
      document.documentElement.style.setProperty(
        "--site-top-offset",
        `${hidden ? 0 : header.current?.offsetHeight ?? 0}px`
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [hidden]);

  useEffect(() => {
    const phone = window.matchMedia(PHONE);
    let lastY = window.scrollY;
    let scrolledUp = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      setScrolled(y > 0);
      if (!phone.matches || y < ALWAYS_SHOWN_ABOVE) {
        scrolledUp = 0;
        setHidden(false);
      } else if (dy > 0) {
        scrolledUp = 0;
        setHidden(true);
      } else if (dy < 0) {
        scrolledUp -= dy;
        if (scrolledUp > REVEAL_AFTER) setHidden(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    phone.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      phone.removeEventListener("change", onScroll);
    };
  }, []);

  const className = ["site-header", "site-top", hidden && "is-hidden", scrolled && "is-scrolled"]
    .filter(Boolean)
    .join(" ");

  // Keyboard users tabbing into a hidden header bring it back.
  return (
    <header ref={header} className={className} onFocus={() => setHidden(false)}>
      {children}
    </header>
  );
}
