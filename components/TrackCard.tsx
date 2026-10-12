import { Fragment } from "react";
import Link from "next/link";
import type { Track } from "@/lib/types";
import { soloistSlug, type SoloistLinks } from "@/lib/content";
import { spotifyEmbedUrl } from "@/lib/spotify";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

// `eyebrow` is the small label above the title, e.g. which release the track is on.
// Soloists found in `soloistLinks` link to their member profile.
export function TrackCard({
  id,
  track,
  eyebrow,
  soloistLinks = {},
}: {
  id?: string;
  track: Track;
  eyebrow?: string;
  soloistLinks?: SoloistLinks;
}) {
  const spotifyEmbed = !track.youtubeId && spotifyEmbedUrl(track.spotifyUrl);
  const soloists = track.soloists?.filter(Boolean) ?? [];
  const credits = [
    soloists.length > 0 && (
      <Fragment key="solo">
        Solo:{" "}
        {soloists.map((name, i) => {
          const slug = soloistSlug(soloistLinks, name);
          return (
            <Fragment key={name}>
              {i > 0 && ", "}
              {slug ? <Link href={`/members/${slug}`}>{name}</Link> : name}
            </Fragment>
          );
        })}
      </Fragment>
    ),
    track.arranger && <Fragment key="arr">Arr. {track.arranger}</Fragment>,
  ].filter(Boolean);

  return (
    <article id={id} className="card">
      {track.youtubeId ? (
        <YouTubeEmbed id={track.youtubeId} title={track.title} />
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
        {credits.length > 0 && (
          <div className="meta">
            {credits.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && " · "}
                {c}
              </Fragment>
            ))}
          </div>
        )}
        {track.spotifyUrl && !spotifyEmbed && (
          <a className="more" href={track.spotifyUrl}>
            Listen on Spotify →
          </a>
        )}
      </div>
    </article>
  );
}
