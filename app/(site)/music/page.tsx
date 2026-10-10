import type { Metadata } from "next";
import { getReleases, getSite } from "@/lib/content";
import { TrackCard } from "@/components/TrackCard";
import { spotifyEmbedUrl } from "@/lib/spotify";

export const metadata: Metadata = { title: "Music" };

export default async function MusicPage() {
  const [site, releases] = await Promise.all([getSite(), getReleases()]);
  const artistEmbed = spotifyEmbedUrl(site.socials.spotify);

  return (
    <div className="container">
      <div className="page-title">
        <h1>Music &amp; videos</h1>
        <p className="lede">Every release, newest first.</p>
      </div>
      {artistEmbed && (
        <iframe
          className="spotify-artist"
          src={artistEmbed}
          title={`${site.name} on Spotify`}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style={{ marginTop: 40 }}
        />
      )}
      <section className="section">
        {releases.map((r) => (
          <article key={r.title + r.releaseDate} className="release">
            <div className="release-head">
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
      </section>
    </div>
  );
}
