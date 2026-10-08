import type { Release } from "@/lib/types";

export function ReleaseCard({ release }: { release: Release }) {
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
      ) : (
        <div className="placeholder ratio-16-9" style={{ background: "var(--ink)", color: "#9c978e" }}>
          [Add a YouTube ID in content/releases.ts]
        </div>
      )}
      <div>
        <div className="eyebrow">{release.kind}</div>
        <h3>{release.title}</h3>
        {credits && <div className="meta">{credits}</div>}
        {release.spotifyUrl && (
          <a className="more" href={release.spotifyUrl}>
            Listen on Spotify →
          </a>
        )}
      </div>
    </article>
  );
}
