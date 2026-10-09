import type { Release } from "@/lib/types";

// Starter data. The live site reads from Sanity (edit at /studio); this file is
// only copied in by `npm run seed` and shown when Sanity isn't configured.
export const releases: Release[] = [
  {
    title: "End of Beginning",
    kind: "Music video",
    releaseDate: "2026-10-02",
    youtubeId: "6gaG0arkF6E",
    arranger: "Ben Cappella",
    soloists: ["Tom Terrell"],
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
