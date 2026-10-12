import Link from "next/link";
import type { Track } from "@/lib/types";

export type TrackRow = {
  key: string;
  track: Track;
  meta?: string; // the grey line under the title
  href?: string; // site path, or an external YouTube / Spotify link
  image?: string; // used when the track has no video thumbnail, e.g. cover art
};

// "Solo: A, B · Arr. C", as plain text (rows are links, so no nested profile links).
export const creditLine = (track: Track) => {
  const soloists = track.soloists?.filter(Boolean) ?? [];
  return [soloists.length > 0 && `Solo: ${soloists.join(", ")}`, track.arranger && `Arr. ${track.arranger}`]
    .filter(Boolean)
    .join(" · ");
};

// Compact one-row-per-song list for the Music page's list view on phones (see "Phone layout" in globals.css).
export function TrackList({ rows }: { rows: TrackRow[] }) {
  return (
    <ul className="track-list">
      {rows.map(({ key, track, meta, href, image }) => {
        const thumb = track.youtubeId ? `https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg` : image;
        const body = (
          <>
            <span className="track-thumb" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {thumb && <img src={thumb} alt="" loading="lazy" />}
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="track-text">
              <span className="track-title">{track.title}</span>
              {meta && <span className="meta">{meta}</span>}
            </span>
          </>
        );
        return (
          <li key={key}>
            {!href ? (
              <div>{body}</div>
            ) : href.startsWith("http") ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {body}
              </a>
            ) : (
              <Link href={href}>{body}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
