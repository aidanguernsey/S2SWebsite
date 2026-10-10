import type { Release } from "@/lib/types";

// Starter data. The live site reads from Sanity (edit at /studio); this file is
// only copied in by `npm run seed` and shown when Sanity isn't configured.
export const releases: Release[] = [
  {
    title: "End of Beginning",
    kind: "Single",
    releaseDate: "2026-10-02",
    spotifyUrl: "https://open.spotify.com/album/5mbO1W2CRfVd1ojCuRwAhK",
    tracks: [
      {
        title: "End of Beginning",
        youtubeId: "6gaG0arkF6E",
        spotifyUrl: "https://open.spotify.com/track/52TNYme0KedEyoh3ufn7Cx",
        arranger: "Ben Cappella",
        soloists: ["Tom Terrell"],
      },
    ],
  },
  {
    title: "After the Ride",
    kind: "EP",
    releaseDate: "2026-08-28",
    spotifyUrl: "https://open.spotify.com/album/1PddP3VY6aDAsx302OtnvT",
    tracks: [
      { title: "Stay - Live", spotifyUrl: "https://open.spotify.com/track/505qpvbKIXLUE2E5uvInJj" },
    ],
  },
];
