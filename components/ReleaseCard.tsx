import Link from "next/link";
import type { Release } from "@/lib/types";
import { releaseAnchor } from "@/lib/content";

// A release (album / EP / single) linking to its block on the Music page.
// Desktop: cover art on top. Phones: a compact row (see "Phone layout" in globals.css).
export function ReleaseCard({ release }: { release: Release }) {
  const meta = [
    release.kind,
    release.releaseDate.slice(0, 4),
    release.tracks.length > 1 && `${release.tracks.length} songs`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/music#${releaseAnchor(release)}`} className="card release-card">
      {release.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="release-card-cover" src={release.cover} alt={`${release.title} cover art`} loading="lazy" />
      ) : (
        <div className="release-card-cover placeholder" aria-hidden="true">
          {release.title.slice(0, 1)}
        </div>
      )}
      <div>
        <div className="eyebrow">{meta}</div>
        <h3>{release.title}</h3>
      </div>
    </Link>
  );
}
