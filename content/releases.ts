import type { Release } from "@/lib/types";

// Newest first is handled for you. For YouTube, paste only the video ID
// (the part after "watch?v=" in the URL).
export const releases: Release[] = [
  {
    title: "[Song Title]",
    kind: "Music video",
    releaseDate: "2026-09-20",
    youtubeId: "",
    arranger: "[Arranger]",
    soloists: ["[Soloist]"],
  },
  {
    title: "[Song Title]",
    kind: "Single",
    releaseDate: "2026-04-01",
    spotifyUrl: "",
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
