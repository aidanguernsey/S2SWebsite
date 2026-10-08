import type { Metadata } from "next";
import { execBoard } from "@/content/members";
import { MemberCard } from "@/components/MemberCard";
import { MemberTabs } from "@/components/MemberTabs";

export const metadata: Metadata = { title: "Exec Board" };

export default function ExecPage() {
  return (
    <div className="container">
      <div className="page-title section-head">
        <div>
          <h1>Exec board</h1>
          <p className="lede">The people keeping the group running this year.</p>
        </div>
        <MemberTabs active="/members/exec" />
      </div>
      <div className="grid-tight">
        {execBoard().map((m) => (
          <MemberCard key={m.slug} member={m} />
        ))}
      </div>
    </div>
  );
}
