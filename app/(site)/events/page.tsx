import type { Metadata } from "next";
import { getEvents, pastEvents, upcomingEvents } from "@/lib/content";
import { DateBox, formatDate } from "@/components/EventBanner";
import type { Event } from "@/lib/types";

export const metadata: Metadata = { title: "Events" };
export const revalidate = 3600;

function EventRow({ event, past }: { event: Event; past?: boolean }) {
  return (
    <article className="event-row" style={past ? { opacity: 0.75 } : undefined}>
      <DateBox iso={event.date} />
      <div className="info">
        <h3>{event.title}</h3>
        <div className="meta">
          {event.venue} · {formatDate(event.date)}
          {event.price && ` · ${event.price}`}
        </div>
        <p style={{ margin: "8px 0 0" }}>{event.description}</p>
      </div>
      {!past && event.ticketUrl && (
        <a href={event.ticketUrl} className="btn btn-dark">Get tickets</a>
      )}
    </article>
  );
}

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = upcomingEvents(events);
  const past = pastEvents(events);
  return (
    <div className="container">
      <div className="page-title">
        <h1>Events</h1>
      </div>
      <section className="section" style={{ paddingTop: 40 }}>
        <h2 style={{ fontSize: 32, marginBottom: 8 }}>Upcoming</h2>
        {upcoming.length ? (
          upcoming.map((e) => <EventRow key={e.slug} event={e} />)
        ) : (
          <p className="lede">Nothing scheduled yet. Follow us for announcements.</p>
        )}
      </section>
      {past.length > 0 && (
        <section className="section">
          <h2 style={{ fontSize: 32, marginBottom: 8 }}>Past shows</h2>
          {past.map((e) => <EventRow key={e.slug} event={e} past />)}
        </section>
      )}
    </div>
  );
}
