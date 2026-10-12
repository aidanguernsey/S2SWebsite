import type { Metadata } from "next";
import {
  getMembers,
  getReleases,
  getSite,
  getVideos,
  releaseAnchor,
  soloistLinks,
  UNRELEASED_ANCHOR,
} from "@/lib/content";
import { TrackCard } from "@/components/TrackCard";
import { TrackList, creditLine } from "@/components/TrackList";
import { ViewToggle } from "@/components/ViewToggle";
import type { Track } from "@/lib/types";

// List-view rows open the song on YouTube (or Spotify) directly.
const listHref = (t: Track) => (t.youtubeId ? `https://www.youtube.com/watch?v=${t.youtubeId}` : t.spotifyUrl);

export const metadata: Metadata = { title: "Music" };

export default async function MusicPage() {
  const [site, releases, videos, members] = await Promise.all([getSite(), getReleases(), getVideos(), getMembers()]);
  const links = soloistLinks(members);

  return (
    <div className="container">
      <div className="page-title">
        <div className="title-row">
          <h1>Music &amp; videos</h1>
          <ViewToggle section="music" />
        </div>
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
        <nav className="jump-chips" aria-label="Jump to release">
          {releases.map((r) => (
            <a key={r.title + r.releaseDate} href={`#${releaseAnchor(r)}`}>
              {r.title}
            </a>
          ))}
          {videos.length > 0 && <a href={`#${UNRELEASED_ANCHOR}`}>Not yet released</a>}
        </nav>
      </div>
      <section className="section">
        {releases.map((r) => (
          <article key={r.title + r.releaseDate} id={releaseAnchor(r)} className="release">
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
            <div className="grid view-icons">
              {r.tracks.map((t, i) => (
                <TrackCard key={i} track={t} soloistLinks={links} />
              ))}
            </div>
            <div className="view-list">
              <TrackList
                rows={r.tracks.map((t, i) => ({
                  key: String(i),
                  track: t,
                  meta: creditLine(t),
                  href: listHref(t),
                  image: r.cover,
                }))}
              />
            </div>
          </article>
        ))}
        {videos.length > 0 && (
          <article id={UNRELEASED_ANCHOR} className="release">
            <div className="release-head">
              <div>
                <div className="eyebrow">Videos · {videos.length} songs</div>
                <h3>Not Yet On Streaming</h3>
              </div>
            </div>
            <div className="grid view-icons">
              {videos.map((v) => (
                <TrackCard key={v.youtubeId} track={v} eyebrow={v.date.slice(0, 4)} soloistLinks={links} />
              ))}
            </div>
            <div className="view-list">
              <TrackList
                rows={videos.map((v) => ({
                  key: v.youtubeId,
                  track: v,
                  meta: [v.date.slice(0, 4), creditLine(v)].filter(Boolean).join(" · "),
                  href: listHref(v),
                }))}
              />
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
