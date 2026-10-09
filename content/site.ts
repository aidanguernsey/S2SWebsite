import type { Site } from "@/lib/types";

// Starter data. The live site reads from Sanity (edit at /studio); this file is
// only copied in by `npm run seed` and shown when Sanity isn't configured.
export const site: Site = {
  name: "Soul2Soul A Cappella",
  shortName: "S2S", // shown in the round logo badge
  school: "Miami University",
  founded: "2013", // Check This
  tagline: "Premier Tenor-Bass A Cappella Ensemble at Miami University",
  description:
    "[One-sentence description of the group: style, size, what makes your sound yours.]",
  // Homepage hero photo, a path under /public. `npm run seed` uploads it to Sanity.
  groupPhoto: "/group.jpeg",
  contactEmail: "[s2s@miamioh.edu]",
  socials: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    spotify: "https://open.spotify.com/artist/3TTjOxFfwV4Bdg4xluwSGy",
    tiktok: "https://tiktok.com/",
  },
  booking: {
    setLength: "[Typical set length, e.g. 15–30 minutes]",
    travelArea: "[Travel area, e.g. within 50 miles of campus]",
    rates: "[Rates, or 'Contact us for pricing']",
  },
  history: [
    {
      year: "[Year]",
      title: "Founded",
      text: "[How and why the group started.]",
    },
    {
      year: "[Year]",
      title: "[Milestone]",
      text: "[First album, competition result, big tour, etc.]",
    },
    {
      year: "[Year]",
      title: "[Milestone]",
      text: "[Another moment worth remembering.]",
    },
  ],
};
