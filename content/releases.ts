import type { Release } from "@/lib/types";

// Newest first is handled for you. For YouTube, paste only the video ID
// (the part after "watch?v=" in the URL). Add `featured: true` to a release
// to pin it to the top of the homepage regardless of its date.
export const releases: Release[] = [
  {
    title: "End of Beginning",
    kind: "Music video",
    releaseDate: "2026-10-02",
    youtubeId: "6gaG0arkF6E",
    arranger: "Ben Cappella",
    soloists: ["Tom Terrel"],
  },
  {
    title: "Stay - Live",
    kind: "Single",
    releaseDate: "2026-04-01",
    spotifyUrl: "https://open.spotify.com/track/505qpvbKIXLUE2E5uvInJj?si=ce181df7206a46f3",
  },
  {
    title: "[Song Title]",
    kind: "Live",
    releaseDate: "2025-12-06",
    youtubeId: "",
  },
];

export const sortedReleases = () =>
  [...releases].sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

// Homepage order: featured releases first, then newest.
export const homepageReleases = () =>
  sortedReleases().sort(
    (a, b) => Number(!!b.featured) - Number(!!a.featured)
  );
