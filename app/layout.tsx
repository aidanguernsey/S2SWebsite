import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

const navLinks = [
  { href: "/music", label: "Music" },
  { href: "/events", label: "Events" },
  { href: "/members", label: "Members" },
  { href: "/about", label: "About" },
  { href: "/shop", label: "Shop" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;700&display=swap"
        />
      </head>
      <body>
        <header className="site-header">
          <nav className="nav container" aria-label="Main">
            <Link href="/" className="brand">
              <span className="badge" aria-hidden="true">{site.shortName}</span>
              <span className="brand-name">{site.name}</span>
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
              <a href={site.socials.instagram}>Instagram</a>
              <a href={site.socials.youtube}>YouTube</a>
              <a href={site.socials.spotify}>Spotify</a>
              <a href={site.socials.tiktok}>TikTok</a>
              <a href={`mailto:${site.contactEmail}`}>Contact</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
