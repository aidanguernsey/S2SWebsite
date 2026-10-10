import type { Track } from "@/lib/types";
import { spotifyEmbedUrl } from "@/lib/spotify";

// `eyebrow` is the small label above the title, e.g. which release the track is on.
export function TrackCard({ track, eyebrow }: { track: Track; eyebrow?: string }) {
  const spotifyEmbed = !track.youtubeId && spotifyEmbedUrl(track.spotifyUrl);
  const soloists = track.soloists?.filter(Boolean);
  const credits = [soloists?.length && `Solo: ${soloists.join(", ")}`, track.arranger && `Arr. ${track.arranger}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="card">
      {track.youtubeId ? (
        <iframe
          className="embed"
          src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}`}
          title={track.title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : spotifyEmbed ? (
        <iframe
          className="embed"
          src={spotifyEmbed}
          title={track.title}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      ) : (
        <div className="placeholder ratio-16-9" style={{ background: "var(--ink)", color: "#9c978e" }}>
          [Add a YouTube or Spotify link in the Studio]
        </div>
      )}
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h3>{track.title}</h3>
        {credits && <div className="meta">{credits}</div>}
        {track.spotifyUrl && !spotifyEmbed && (
          <a className="more" href={track.spotifyUrl}>
            Listen on Spotify →
          </a>
        )}
      </div>
    </article>
  );
}
