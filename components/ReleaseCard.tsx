import type { Release } from "@/lib/types";
import { spotifyEmbedUrl } from "@/lib/spotify";

export function ReleaseCard({ release }: { release: Release }) {
  const spotifyEmbed = !release.youtubeId && spotifyEmbedUrl(release.spotifyUrl);
  const credits = [
    release.arranger && `Arr. ${release.arranger}`,
    release.soloists?.length && `Solo: ${release.soloists.join(", ")}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="card">
      {release.youtubeId ? (
        <iframe
          className="embed"
          src={`https://www.youtube-nocookie.com/embed/${release.youtubeId}`}
          title={release.title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : spotifyEmbed ? (
        <iframe
          className="embed"
          src={spotifyEmbed}
          title={release.title}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      ) : (
        <div className="placeholder ratio-16-9" style={{ background: "var(--ink)", color: "#9c978e" }}>
          [Add a YouTube or Spotify link in the Studio]
        </div>
      )}
      <div>
        <div className="eyebrow">{release.kind}</div>
        <h3>{release.title}</h3>
        {credits && <div className="meta">{credits}</div>}
        {release.spotifyUrl && !spotifyEmbed && (
          <a className="more" href={release.spotifyUrl}>
            Listen on Spotify →
          </a>
        )}
      </div>
    </article>
  );
}
