export type VoicePart =
  | "Tenor I"
  | "Tenor II"
  | "Baritone"
  | "Bass"
  | "Vocal Percussion";

export type Member = {
  slug: string; // used in the URL: /members/<slug>
  name: string;
  voicePart: VoicePart;
  status: "current" | "alumni";
  classYear: number;
  major?: string;
  hometown?: string;
  execRole?: string; // e.g. "President" — leave out if not on exec
  photo?: string; // path under /public, e.g. "/members/jane-doe.jpg"
  bio: string;
  solos?: string[];
  funFact?: string;
};

export type Event = {
  slug: string;
  title: string;
  date: string; // ISO format: "2026-12-05T19:30:00"
  venue: string;
  description: string;
  ticketUrl?: string;
  price?: string;
};

export type Release = {
  title: string;
  kind: "Music video" | "Single" | "Album" | "Live";
  releaseDate: string; // "2026-04-12"
  youtubeId?: string; // the part after watch?v=
  spotifyUrl?: string;
  arranger?: string;
  soloists?: string[];
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
