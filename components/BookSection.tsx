import Link from "next/link";
import { getSite } from "@/lib/content";
import { GigRequestForm } from "./GigRequestForm";

// compactOnMobile: on phones, show a short card linking to /book instead of the whole form.
export async function BookSection({
  headingLevel = "h2",
  compactOnMobile = false,
}: {
  headingLevel?: "h1" | "h2";
  compactOnMobile?: boolean;
}) {
  const Heading = headingLevel;
  const { booking } = await getSite();
  const details = [booking.setLength, booking.travelArea, booking.rates].filter(Boolean);
  return (
    <>
      {compactOnMobile && (
        <section className="container book-compact">
          <div>
            <h2>Book us</h2>
            <p>Birthdays, campus events, other events you might be hosting!</p>
            <Link href="/book" className="btn btn-accent">
              Request a gig
            </Link>
          </div>
        </section>
      )}
      <section id="book" className={compactOnMobile ? "container desktop-only" : "container"}>
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
    </>
  );
}
