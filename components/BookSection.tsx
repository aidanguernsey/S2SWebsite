import { site } from "@/content/site";
import { GigRequestForm } from "./GigRequestForm";

export function BookSection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  return (
    <section id="book" className="container">
      <div className="book">
        <div>
          <Heading style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 800 }}>
            Book us for your event
          </Heading>
          <p style={{ fontSize: 18 }}>
            Weddings, campus events, holiday parties, singing valentines. Tell us
            about it and our business manager will get back to you.
          </p>
          <ul>
            <li>{site.booking.setLength}</li>
            <li>{site.booking.travelArea}</li>
            <li>{site.booking.rates}</li>
          </ul>
        </div>
        <GigRequestForm />
      </div>
    </section>
  );
}
