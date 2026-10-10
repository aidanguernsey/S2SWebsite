import type { Metadata } from "next";
import { getReleases, getSite, getVideos } from "@/lib/content";
import { TrackCard } from "@/components/TrackCard";

export const metadata: Metadata = { title: "Music" };

export default async function MusicPage() {
  const [site, releases, videos] = await Promise.all([getSite(), getReleases(), getVideos()]);

  return (
    <div className="container">
      <div className="page-title">
        <h1>Music &amp; videos</h1>
        <p className="lede">Every release, newest first.</p>
        {site.socials.spotify && (
          <a
            className="btn btn-dark"
            href={site.socials.spotify}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 24 }}
          >
            Follow {site.name} on Spotify →
          </a>
        )}
      </div>
      <section className="section">
        {releases.map((r) => (
          <article key={r.title + r.releaseDate} className="release">
            <div className="release-head">
              <div className="release-title">
                {r.cover && <img className="release-cover" src={r.cover} alt={`${r.title} cover art`} loading="lazy" />}
                <div>
                  <div className="eyebrow">
                    {[
                      r.kind,
                      r.releaseDate.slice(0, 4),
                      r.tracks.length > 1 && `${r.tracks.length} songs`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <h3>{r.title}</h3>
                </div>
              </div>
              {r.spotifyUrl && (
                <a className="more" href={r.spotifyUrl} target="_blank" rel="noopener noreferrer">
                  Listen to the {r.kind === "EP" ? "EP" : r.kind.toLowerCase()} on Spotify →
                </a>
              )}
            </div>
            <div className="grid">
              {r.tracks.map((t, i) => (
                <TrackCard key={i} track={t} />
              ))}
            </div>
          </article>
        ))}
        {videos.length > 0 && (
          <article className="release">
            <div className="release-head">
              <div>
                <div className="eyebrow">Videos · {videos.length} songs</div>
                <h3>Not Yet On Streaming</h3>
              </div>
            </div>
            <div className="grid">
              {videos.map((v) => (
                <TrackCard key={v.youtubeId} track={v} eyebrow={v.date.slice(0, 4)} />
              ))}
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
