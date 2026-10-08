import type { Metadata } from "next";
import { currentMembers, voicePartOrder } from "@/content/members";
import { MemberCard } from "@/components/MemberCard";
import { MemberTabs } from "@/components/MemberTabs";

export const metadata: Metadata = { title: "Members" };

export default function MembersPage() {
  const members = currentMembers();
  return (
    <div className="container">
      <div className="page-title section-head">
        <div>
          <h1>Meet the voices</h1>
          <p className="lede">{members.length} singers, grouped by voice part.</p>
        </div>
        <MemberTabs active="/members" />
      </div>
      {voicePartOrder.map((part) => {
        const group = members.filter((m) => m.voicePart === part);
        if (!group.length) return null;
        return (
          <section key={part} className="part-group">
            <h2 style={{ fontSize: 28, marginBottom: 20 }}>{part}</h2>
            <div className="grid-tight">
              {group.map((m) => (
                <MemberCard key={m.slug} member={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
