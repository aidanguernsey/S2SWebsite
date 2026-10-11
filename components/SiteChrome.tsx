import Link from "next/link";
import { getReleases, getSite, getVideos, releaseAnchor, UNRELEASED_ANCHOR } from "@/lib/content";

const memberLinks = [
  { href: "/members", label: "Current members", sub: "This year’s group" },
  { href: "/members/exec", label: "Exec board", sub: "Who runs the group" },
  { href: "/alumni", label: "Alumni", sub: "Past members" },
];

// Header and footer around every public page (not the Studio).
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [site, releases, videos] = await Promise.all([getSite(), getReleases(), getVideos()]);
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
            {/* Dropdowns open on hover or keyboard focus (CSS only); on touch screens the top links just navigate. */}
            <div className="nav-item">
              <Link href="/music">Music</Link>
              <div className="nav-menu">
                <div className="nav-menu-panel nav-menu-music">
                  <div className="nav-menu-heading">Latest releases</div>
                  {releases.slice(0, 4).map((r) => (
                    <Link key={r.title + r.releaseDate} href={`/music#${releaseAnchor(r)}`}>
                      {r.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="nav-menu-cover" src={r.cover} alt="" loading="lazy" />
                      ) : (
                        <span className="nav-menu-cover" aria-hidden="true">
                          {r.title.slice(0, 1)}
                        </span>
                      )}
                      <span>
                        <span className="nav-menu-label">{r.title}</span>
                        <span className="nav-menu-sub">
                          {r.kind} · {r.releaseDate.slice(0, 4)}
                        </span>
                      </span>
                    </Link>
                  ))}
                  {videos.length > 0 && (
                    <>
                      <hr />
                      <Link href={`/music#${UNRELEASED_ANCHOR}`}>
                        <span className="nav-menu-cover nav-menu-cover-video" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M8 5v14l11-7z" fill="currentColor" />
                          </svg>
                        </span>
                        <span>
                          <span className="nav-menu-label">Not yet released</span>
                          <span className="nav-menu-sub">Songs only on YouTube so far</span>
                        </span>
                      </Link>
                    </>
                  )}
                  <hr />
                  <Link href="/music" className="nav-menu-all">
                    <span className="nav-menu-label">See all music</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
            <Link href="/events">Events</Link>
            <div className="nav-item">
              <Link href="/members">Members</Link>
              <div className="nav-menu">
                <div className="nav-menu-panel nav-menu-members">
                  {memberLinks.map((l) => (
                    <Link key={l.href} href={l.href}>
                      <span>
                        <span className="nav-menu-label">{l.label}</span>
                        <span className="nav-menu-sub">{l.sub}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/about">About</Link>
            <Link href="/shop">Shop</Link>
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
