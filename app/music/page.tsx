import type { Metadata } from "next";
import { sortedReleases } from "@/content/releases";
import { ReleaseCard } from "@/components/ReleaseCard";

export const metadata: Metadata = { title: "Music" };

export default function MusicPage() {
  return (
    <div className="container">
      <div className="page-title">
        <h1>Music &amp; videos</h1>
        <p className="lede">Every release, newest first.</p>
      </div>
      <div className="grid" style={{ marginTop: 40 }}>
        {sortedReleases().map((r) => (
          <ReleaseCard key={r.title + r.releaseDate} release={r} />
        ))}
      </div>
    </div>
  );
}
