import type { Metadata } from "next";
import { alumni } from "@/content/members";
import { MemberCard } from "@/components/MemberCard";
import { MemberTabs } from "@/components/MemberTabs";

export const metadata: Metadata = { title: "Alumni" };

export default function AlumniPage() {
  const all = alumni();
  const years = [...new Set(all.map((m) => m.classYear))];
  return (
    <div className="container">
      <div className="page-title section-head">
        <div>
          <h1>Alumni</h1>
          <p className="lede">Once a member, always a member.</p>
        </div>
        <MemberTabs active="/alumni" />
      </div>
      {years.map((year) => (
        <section key={year} className="part-group">
          <h2 style={{ fontSize: 28, marginBottom: 20 }}>Class of {year}</h2>
          <div className="grid-tight">
            {all
              .filter((m) => m.classYear === year)
              .map((m) => (
                <MemberCard key={m.slug} member={m} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
