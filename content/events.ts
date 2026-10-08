import type { Event } from "@/lib/types";

// Past events move to the archive automatically once their date passes.
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

const byDate = (a: Event, b: Event) =>
  new Date(a.date).getTime() - new Date(b.date).getTime();

export const upcomingEvents = (now = new Date()) =>
  events.filter((e) => new Date(e.date) >= now).sort(byDate);

export const pastEvents = (now = new Date()) =>
  events
    .filter((e) => new Date(e.date) < now)
    .sort(byDate)
    .reverse();
