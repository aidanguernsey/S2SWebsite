import type { Metadata } from "next";
import { execBoard, getMembers } from "@/lib/content";
import { MemberCard } from "@/components/MemberCard";
import { MemberTabs } from "@/components/MemberTabs";
import { ViewToggle } from "@/components/ViewToggle";

export const metadata: Metadata = { title: "Exec Board" };

export default async function ExecPage() {
  const board = execBoard(await getMembers());
  return (
    <div className="container">
      <div className="page-title section-head">
        <div>
          <div className="title-row">
            <h1>Exec board</h1>
            <ViewToggle section="members" />
          </div>
          <p className="lede">The people keeping the group running this year.</p>
        </div>
        <MemberTabs active="/members/exec" />
      </div>
      <div className="grid-tight member-grid">
        {board.map((m) => (
          <MemberCard key={m.slug} member={m} />
        ))}
      </div>
    </div>
  );
}
