"use client";

import { useEffect, useState } from "react";

type View = "icons" | "list";
type Section = "members" | "music";

// The choice is stored per section and applied as data-view-<section>="list" on
// <html>, which the phone CSS reads. SiteChrome's inline script restores it before
// first paint so the page doesn't flash the other layout.
const storageKey = (section: Section) => `s2s-view-${section}`;
const attr = (section: Section) => `data-view-${section}`;

export const restoreViewsScript = `try{["members","music"].forEach(function(s){if(localStorage.getItem("s2s-view-"+s)==="list")document.documentElement.setAttribute("data-view-"+s,"list")})}catch(e){}`;

// Icons / list switch, shown on phones only.
export function ViewToggle({ section }: { section: Section }) {
  const [view, setView] = useState<View>("icons");

  useEffect(() => {
    if (document.documentElement.getAttribute(attr(section)) === "list") setView("list");
  }, [section]);

  function choose(next: View) {
    setView(next);
    if (next === "list") document.documentElement.setAttribute(attr(section), "list");
    else document.documentElement.removeAttribute(attr(section));
    try {
      localStorage.setItem(storageKey(section), next);
    } catch {}
  }

  return (
    <div className="view-toggle" role="group" aria-label="View as">
      <button type="button" aria-label="Icons" aria-pressed={view === "icons"} onClick={() => choose("icons")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      </button>
      <button type="button" aria-label="List" aria-pressed={view === "list"} onClick={() => choose("list")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M9 6h11M9 12h11M9 18h11" />
          <circle cx="4.5" cy="6" r="1" />
          <circle cx="4.5" cy="12" r="1" />
          <circle cx="4.5" cy="18" r="1" />
        </svg>
      </button>
    </div>
  );
}
