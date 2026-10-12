import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMember,
  getMembers,
  getReleases,
  getVideos,
  memberSoloTracks,
  sameSong,
  songHref,
  soloistLinks,
} from "@/lib/content";
import { MemberPhoto } from "@/components/MemberCard";
import { TrackCard } from "@/components/TrackCard";

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
  const [{ slug }, members, releases, videos] = await Promise.all([params, getMembers(), getReleases(), getVideos()]);
  const member = members.find((m) => m.slug === slug);
  if (!member) notFound();

  // Every solo is listed by name; recorded ones also get a player below, and
  // their name in the list jumps to it.
  const soloTracks = memberSoloTracks(member, releases, videos);
  const solos = (member.solos?.filter((s) => s.trim()) ?? []).map((name) => {
    const i = soloTracks.findIndex(({ track }) => sameSong(name, track.title));
    return { name, href: i === -1 ? undefined : `#solo-${i}` };
  });
  const favoriteHref = member.favoriteArrangement && songHref(member.favoriteArrangement, releases, videos);

  const facts = [
    { label: "Voice part", value: member.voicePart },
    { label: member.status === "alumni" ? "Class of" : "Class year", value: member.classYear },
    member.execRole && { label: "Exec role", value: member.execRole },
    member.major && { label: "Major", value: member.major },
    member.minor && { label: "Minor", value: member.minor },
    member.job && { label: "Job / industry", value: member.job },
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
          {solos.length > 0 && (
            <>
              <h2 style={{ fontSize: 24, margin: "32px 0 8px" }}>Solos</h2>
              <ul className="solo-list">
                {solos.map(({ name, href }) => (
                  <li key={name}>{href ? <a href={href}>{name}</a> : name}</li>
                ))}
              </ul>
            </>
          )}
          {member.funFact && (
            <>
              <h2 style={{ fontSize: 24, margin: "32px 0 8px" }}>Fun fact</h2>
              <p>{member.funFact}</p>
            </>
          )}
          {member.favoriteArrangement && (
            <>
              <h2 style={{ fontSize: 24, margin: "32px 0 8px" }}>Favorite S2S arrangement</h2>
              <p>
                {favoriteHref ? <Link href={favoriteHref}>{member.favoriteArrangement}</Link> : member.favoriteArrangement}
              </p>
            </>
          )}
          {member.favoriteMemory && (
            <>
              <h2 style={{ fontSize: 24, margin: "32px 0 8px" }}>Favorite S2S memory</h2>
              <p>{member.favoriteMemory}</p>
            </>
          )}
        </div>
      </article>
      {soloTracks.length > 0 && (
        <section className="release" style={{ paddingBottom: 96 }}>
          <div className="section-head">
            <h2>Solos</h2>
          </div>
          <div className="grid">
            {soloTracks.map(({ track, eyebrow }, i) => (
              <TrackCard key={i} id={`solo-${i}`} track={track} eyebrow={eyebrow} soloistLinks={soloistLinks(members)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
