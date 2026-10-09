import type { Metadata } from "next";
import { getSite } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const site = await getSite();
  return (
    <div className="container">
      <div className="page-title">
        <h1>Our story</h1>
        <p className="lede">
          {site.name} has been singing at {site.school} since {site.founded}.
        </p>
      </div>
      <section className="section" style={{ paddingTop: 48 }}>
        <ol className="timeline">
          {site.history.map((h, i) => (
            <li key={i}>
              <span className="year">{h.year}</span>
              <div>
                <h2 style={{ fontSize: 24 }}>{h.title}</h2>
                <p style={{ margin: "6px 0 0" }}>{h.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
