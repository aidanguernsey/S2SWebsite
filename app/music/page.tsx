import type { Metadata } from "next";
import { sortedReleases } from "@/content/releases";
import { site } from "@/content/site";
import { ReleaseCard } from "@/components/ReleaseCard";
import { spotifyEmbedUrl } from "@/lib/spotify";

export const metadata: Metadata = { title: "Music" };

export default function MusicPage() {
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
      <div className="grid" style={{ marginTop: 40 }}>
        {sortedReleases().map((r) => (
          <ReleaseCard key={r.title + r.releaseDate} release={r} />
        ))}
      </div>
    </div>
  );
}
