import Link from "next/link";
import type { Event } from "@/lib/types";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function DateBox({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <div className="datebox" aria-hidden="true">
      <span className="mon">{d.toLocaleString("en-US", { month: "short" })}</span>
      <span className="day">{d.getDate()}</span>
    </div>
  );
}

export function EventBanner({ event }: { event: Event }) {
  return (
    <div className="event-banner">
      <div className="when">
        <DateBox iso={event.date} />
        <div>
          <div className="eyebrow" style={{ color: "var(--ink)" }}>Next concert</div>
          <h3>{event.title}</h3>
          <div>
            {event.venue} · {formatDate(event.date)}
            {event.price && ` · ${event.price}`}
          </div>
        </div>
      </div>
      <div className="actions" style={{ marginTop: 0 }}>
        {event.ticketUrl && (
          <a href={event.ticketUrl} className="btn btn-dark">
            Get tickets
          </a>
        )}
        <Link href="/events" className="btn btn-outline">
          All events
        </Link>
      </div>
    </div>
  );
}
