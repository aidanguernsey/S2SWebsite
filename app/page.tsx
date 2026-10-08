import Link from "next/link";
import { site } from "@/content/site";
import { upcomingEvents } from "@/content/events";
import { sortedReleases } from "@/content/releases";
import { currentMembers, execBoard } from "@/content/members";
import { merch } from "@/content/merch";
import { EventBanner } from "@/components/EventBanner";
import { ReleaseCard } from "@/components/ReleaseCard";
import { MemberCard } from "@/components/MemberCard";
import { BookSection } from "@/components/BookSection";

// Re-check every hour so "next concert" stays current without a redeploy.
export const revalidate = 3600;

export default function Home() {
  const next = upcomingEvents()[0];
  const releases = sortedReleases().slice(0, 3);
  const latest = releases[0];
  // Exec board first, then everyone else, five cards total.
  const featured = [
    ...execBoard(),
    ...currentMembers().filter((m) => !m.execRole),
  ].slice(0, 5);

  return (
    <>
      <div className="site-header dark">
        <section className="hero container">
          <div>
            <div className="eyebrow">
              {site.school} · Est. {site.founded}
            </div>
            <h1 style={{ marginTop: 20 }}>{site.tagline}</h1>
            <p>{site.description}</p>
            <div className="actions">
              <Link href="/music" className="btn btn-accent">
                Watch our latest
              </Link>
              <Link href="/book" className="btn btn-outline">
                Book us for a gig
              </Link>
            </div>
          </div>
          <div>
            <div className="placeholder" style={{ aspectRatio: "4 / 3" }}>
              [Group photo — add to /public and swap this out]
            </div>
            {latest && (
              <p style={{ fontSize: 16, marginTop: 16 }}>
                New: <strong style={{ color: "var(--paper)" }}>{latest.title}</strong>{" "}
                — out now
              </p>
            )}
          </div>
        </section>
      </div>

      {next && (
        <section className="container" style={{ paddingTop: 72 }}>
          <EventBanner event={next} />
        </section>
      )}

      <section className="section container">
        <div className="section-head">
          <h2>Music &amp; videos</h2>
          <Link href="/music" className="more">See every release →</Link>
        </div>
        <div className="grid">
          {releases.map((r) => (
            <ReleaseCard key={r.title + r.releaseDate} release={r} />
          ))}
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Meet the voices</h2>
              <p className="lede">
                {currentMembers().length} singers, one sound. Tap anyone to read their bio.
              </p>
            </div>
            <Link href="/members" className="more">Meet the whole group →</Link>
          </div>
          <div className="grid-tight">
            {featured.map((m) => (
              <MemberCard key={m.slug} member={m} />
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Merch</h2>
          <Link href="/shop" className="more">Visit the shop →</Link>
        </div>
        <div className="grid">
          {merch.slice(0, 3).map((p) => (
            <div key={p.name} className="product">
              <div className="placeholder ratio-1">[Product photo]</div>
              <div className="product-row">
                <div>
                  <strong>{p.name}</strong>
                  <div className="meta">{p.price}</div>
                </div>
                <Link href="/shop" className="btn btn-dark">View</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BookSection />
    </>
  );
}
