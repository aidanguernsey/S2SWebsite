import Link from "next/link";
import {
  currentMembers,
  execBoard,
  getEvents,
  getMembers,
  getReleases,
  getSite,
  homepageReleases,
  homepageTracks,
  upcomingEvents,
} from "@/lib/content";
import { EventBanner } from "@/components/EventBanner";
import { TrackCard } from "@/components/TrackCard";
import { MemberCard } from "@/components/MemberCard";
import { BookSection } from "@/components/BookSection";

// Re-check every hour so "next concert" stays current without a redeploy.
export const revalidate = 3600;

export default async function Home() {
  const [site, events, allReleases, members] = await Promise.all([
    getSite(),
    getEvents(),
    getReleases(),
    getMembers(),
  ]);
  const next = upcomingEvents(events)[0];
  const latest = homepageReleases(allReleases)[0];
  const tracks = homepageTracks(allReleases).slice(0, 3);
  const current = currentMembers(members);
  // Exec board first, then everyone else, five cards total.
  const featured = [
    ...execBoard(members),
    ...current.filter((m) => !m.execRole),
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
            <div className="photo-wrap" style={{ aspectRatio: "4 / 3" }}>
              {site.groupPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={site.groupPhoto} alt={`${site.name} group photo`} />
              ) : (
                <div className="placeholder" style={{ height: "100%" }}>
                  [Group photo: add one in Studio → Site settings]
                </div>
              )}
            </div>
            {latest && (
              <p style={{ fontSize: 16, marginTop: 16 }}>
                New:{" "}
                {latest.spotifyUrl ? (
                  <a
                    href={latest.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--paper)", fontWeight: 700 }}
                  >
                    {latest.title}
                  </a>
                ) : (
                  <strong style={{ color: "var(--paper)" }}>{latest.title}</strong>
                )}{" "}
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
          <h2>Soul2Soul Trailer</h2>
        </div>
        <iframe
          className="embed"
          src="https://www.youtube-nocookie.com/embed/5BAdZWY3c4o"
          title="Soul2Soul Trailer"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Music &amp; videos</h2>
          <Link href="/music" className="more">See every release →</Link>
        </div>
        <div className="grid">
          {tracks.map(({ track, release }) => (
            <TrackCard
              key={release.title + release.releaseDate + track.title}
              track={track}
              eyebrow={release.kind === "Single" ? "Single" : `${release.title} · ${release.kind}`}
            />
          ))}
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Meet the voices</h2>
              <p className="lede">
                {current.length} singers, one sound. Tap anyone to read their bio.
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

      <BookSection />
    </>
  );
}
