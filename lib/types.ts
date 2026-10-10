// In the order they're listed on the Members page.
export const voiceParts = [
  "Tenor I",
  "Tenor II",
  "Baritone",
  "Bass",
  "Vocal Percussion",
] as const;

export type VoicePart = (typeof voiceParts)[number];

export type Member = {
  slug: string; // used in the URL: /members/<slug>
  name: string;
  voicePart: VoicePart;
  status: "current" | "alumni";
  classYear: number;
  major?: string;
  hometown?: string;
  execRole?: string; // e.g. "President" — leave out if not on exec
  photo?: string; // image URL (Sanity CDN, or a path under /public)
  bio: string;
  solos?: string[];
  funFact?: string;
};

export type Event = {
  slug: string;
  title: string;
  date: string; // ISO format, e.g. "2026-12-06T00:30:00Z"
  venue: string;
  description: string;
  ticketUrl?: string;
  price?: string;
};

// In the order they're grouped on the Music page.
export const releaseKinds = ["Album", "EP", "Single"] as const;

export type ReleaseKind = (typeof releaseKinds)[number];

export type Track = {
  title: string;
  youtubeId?: string; // the part after watch?v=
  spotifyUrl?: string; // the track itself; shown as a player when there's no video
  arranger?: string;
  soloists?: string[];
};

export type Release = {
  title: string;
  kind: ReleaseKind;
  releaseDate: string; // "2026-04-12"
  cover?: string; // cover art URL
  spotifyUrl?: string; // the whole album / EP / single
  featured?: boolean; // pin to the top of the homepage, ahead of newer releases
  tracks: Track[]; // in track-list order
};

// A video of a song that isn't on any release yet.
export type Video = Track & {
  youtubeId: string;
  date: string; // when it was posted, "2025-11-21"
};

export type MerchItem = {
  name: string;
  price: string;
  image?: string;
  // A Stripe Payment Link or Printful/Shopify product URL.
  // No custom checkout code needed — see README.
  buyUrl?: string;
  sizes?: string[];
};

export type Site = {
  name: string;
  shortName: string; // shown in the round logo badge
  school: string;
  founded: string;
  tagline: string;
  description: string;
  groupPhoto?: string; // homepage hero photo URL
  contactEmail: string;
  socials: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    tiktok?: string;
  };
  booking: {
    setLength?: string;
    travelArea?: string;
    rates?: string;
  };
  history: { year: string; title: string; text: string }[];
};
