import Link from "next/link";
import type { Member } from "@/lib/types";

export function MemberPhoto({ member, className = "" }: { member: Member; className?: string }) {
  return (
    <div className={`photo-wrap ratio-4-5 ${className}`}>
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photo} alt={`Photo of ${member.name}`} />
      ) : (
        <div className="placeholder" style={{ height: "100%" }}>
          [Photo of {member.name}]
        </div>
      )}
      <span className="pill">{member.voicePart}</span>
    </div>
  );
}

export function MemberCard({ member }: { member: Member }) {
  const subtitle =
    member.status === "alumni"
      ? `Class of ${member.classYear}`
      : [member.execRole, member.major, `’${String(member.classYear).slice(2)}`]
          .filter(Boolean)
          .join(" · ");

  return (
    <Link href={`/members/${member.slug}`} className="card">
      <MemberPhoto member={member} />
      <div>
        <h3>{member.name}</h3>
        <div className="meta">{subtitle}</div>
      </div>
    </Link>
  );
}
