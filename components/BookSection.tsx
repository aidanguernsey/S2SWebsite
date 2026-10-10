import { getSite } from "@/lib/content";
import { GigRequestForm } from "./GigRequestForm";

export async function BookSection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  const { booking } = await getSite();
  const details = [booking.setLength, booking.travelArea, booking.rates].filter(Boolean);
  return (
    <section id="book" className="container">
      <div className="book">
        <div>
          <Heading style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 800 }}>
            Book us for your event
          </Heading>
          <p style={{ fontSize: 18 }}>
            Birthdays, campus events, other events you might be hosting! Tell us
            about it and our business manager will get back to you.
          </p>
          {details.length > 0 && (
            <ul>
              {details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
        <GigRequestForm />
      </div>
    </section>
  );
}
