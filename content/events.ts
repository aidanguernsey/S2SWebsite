import type { Event } from "@/lib/types";

// Starter data. The live site reads from Sanity (edit at /studio); this file is
// only copied in by `npm run seed` and shown when Sanity isn't configured.
// Dates are local time at Miami (Eastern); the seed converts them to UTC.
export const events: Event[] = [
  {
    slug: "fall-concert-2026",
    title: "[Fall Concert Name]",
    date: "2026-12-05T19:30:00",
    venue: "[Venue]",
    description: "[What the concert is, guest groups, anything special.]",
    ticketUrl: "#",
    price: "[Price or Free]",
  },
  {
    slug: "spring-concert-2027",
    title: "[Spring Concert Name]",
    date: "2027-04-17T19:00:00",
    venue: "[Venue]",
    description: "[Description.]",
  },
  {
    slug: "spring-concert-2026",
    title: "[Last Spring's Concert]",
    date: "2026-04-18T19:00:00",
    venue: "[Venue]",
    description: "[Description.]",
  },
];
