import type { Metadata } from "next";
import { getReleases, getSite } from "@/lib/content";
import { ReleaseCard } from "@/components/ReleaseCard";
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
      <div className="grid" style={{ marginTop: 40 }}>
        {releases.map((r) => (
          <ReleaseCard key={r.title + r.releaseDate} release={r} />
        ))}
      </div>
    </div>
  );
}
