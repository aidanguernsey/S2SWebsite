import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember, getMembers } from "@/lib/content";
import { MemberPhoto } from "@/components/MemberCard";

type Props = { params: Promise<{ slug: string }> };

// Pre-build one page per member at deploy time. Members added later in the
// Studio get their page built on first visit.
export async function generateStaticParams() {
  return (await getMembers()).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getMember((await params).slug);
  return member ? { title: member.name, description: member.bio.slice(0, 150) } : {};
}

export default async function MemberProfile({ params }: Props) {
  const member = await getMember((await params).slug);
  if (!member) notFound();

  const facts = [
    { label: "Voice part", value: member.voicePart },
    { label: member.status === "alumni" ? "Class of" : "Class year", value: member.classYear },
    member.execRole && { label: "Exec role", value: member.execRole },
    member.major && { label: "Major", value: member.major },
    member.hometown && { label: "Hometown", value: member.hometown },
  ].filter(Boolean) as { label: string; value: string | number }[];

  const backHref = member.status === "alumni" ? "/alumni" : "/members";

  return (
    <div className="container">
      <div style={{ paddingTop: 32 }}>
        <Link href={backHref} className="more">
          ← Back to {member.status === "alumni" ? "alumni" : "members"}
        </Link>
      </div>
      <article className="profile">
        <div className="photo">
          <MemberPhoto member={member} />
        </div>
        <div className="details">
          <div className="eyebrow">
            {member.status === "alumni" ? "Alum" : member.execRole ?? "Member"}
          </div>
          <h1>{member.name}</h1>
          <ul className="facts">
            {facts.map((f) => (
              <li key={f.label}>
                <span className="label">{f.label}</span>
                {f.value}
              </li>
            ))}
          </ul>
          <p className="bio">{member.bio}</p>
          {member.solos?.length ? (
            <>
              <h2 style={{ fontSize: 24, margin: "32px 0 8px" }}>Solos</h2>
              <ul>{member.solos.map((s) => <li key={s}>{s}</li>)}</ul>
            </>
          ) : null}
          {member.funFact && (
            <>
              <h2 style={{ fontSize: 24, margin: "32px 0 8px" }}>Fun fact</h2>
              <p>{member.funFact}</p>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
