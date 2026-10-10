import Link from "next/link";
import { getSite } from "@/lib/content";

const navLinks = [
  { href: "/music", label: "Music" },
  { href: "/events", label: "Events" },
  { href: "/members", label: "Members" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop" },
];

// Header and footer around every public page (not the Studio).
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const socials = [
    { href: site.socials.instagram, label: "Instagram" },
    { href: site.socials.youtube, label: "YouTube" },
    { href: site.socials.spotify, label: "Spotify" },
    { href: site.socials.tiktok, label: "TikTok" },
  ].filter((s) => s.href);

  return (
    <>
      <header className="site-header">
        <nav className="nav container" aria-label="Main">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt={site.name} width={122} height={56} />
          </Link>
          <div className="nav-links">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
            <Link href="/book" className="btn btn-accent">
              Book us
            </Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container">
          <div>
            <strong className="brand-name" style={{ color: "var(--ink)" }}>
              {site.name}
            </strong>
            <div>A student organization at {site.school}</div>
          </div>
          <nav aria-label="Social">
            {socials.map((s) => (
              <a key={s.label} href={s.href}>{s.label}</a>
            ))}
            <a href={`mailto:${site.contactEmail}`}>Contact</a>
          </nav>
        </div>
        <div className="footer-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-rooster.png" alt="" width={64} height={91} />
        </div>
      </footer>
    </>
  );
}
