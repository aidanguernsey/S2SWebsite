// In the order they're listed on the Members page.
export const voiceParts = [
  "Tenor I",
  "Tenor II",
  "Tenor III",
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
  yearJoined?: number;
  semesters?: number; // semesters in the group, as of when they filled out the form
  performedVP?: boolean; // also performed vocal percussion
  major?: string;
  minor?: string;
  job?: string; // current job or industry, mostly for alumni
  hometown?: string;
  execRole?: string; // e.g. "President" — leave out if not on exec
  pastExecRoles?: string[]; // roles they no longer hold, alumni included
  photo?: string; // image URL (Sanity CDN, or a path under /public)
  bio: string;
  solos?: string[];
  funFact?: string;
  favoriteArrangement?: string; // links to the Music page when it matches a track
  favoriteMemory?: string;
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

// ---- Shop ----
// Products and carts come from Fourthwall (lib/fourthwall.ts maps their API into these).

export type Money = { value: number; currency: string };

export type ShopImage = { url: string; width: number; height: number };

export type ShopVariant = {
  id: string;
  name: string; // e.g. "Black, M"
  price: Money; // can differ by size (2XL and up often cost more)
  compareAtPrice?: Money; // the "was" price during a sale
  color?: { name: string; swatch: string }; // swatch is a hex color
  size?: string;
  inStock: boolean;
  images: ShopImage[]; // photos of this color
};

export type ShopProduct = {
  id: string;
  slug: string; // used in the URL: /shop/<slug>
  name: string;
  description?: string; // HTML, written in the Fourthwall dashboard
  details: { title: string; html: string }[]; // fabric, fit, care, etc.
  soldOut: boolean;
  images: ShopImage[];
  variants: ShopVariant[];
};

export type CartLine = {
  product: { name: string; slug: string };
  variant: ShopVariant;
  quantity: number;
};

export type Cart = {
  id: string;
  lines: CartLine[];
  count: number; // total items, for the header badge
  subtotal: Money; // before shipping and tax, which Fourthwall adds at checkout
};
