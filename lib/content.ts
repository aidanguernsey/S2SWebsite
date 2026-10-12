// Everything the pages show comes through here. Content is edited in Sanity
// Studio (/studio); until Sanity is configured, the starter data in content/ is used.
import { defineQuery } from "next-sanity";
import { client } from "@/sanity/client";
import { schoolTimeToIso } from "@/lib/time";
import type { Event, Member, MerchItem, Release, Site, Track, Video } from "@/lib/types";
import { site as localSite } from "@/content/site";
import { members as localMembers } from "@/content/members";
import { events as localEvents } from "@/content/events";
import { releases as localReleases } from "@/content/releases";
import { merch as localMerch } from "@/content/merch";

// Cached for a minute; the /api/revalidate webhook clears it on every publish.
export const CACHE_TAG = "sanity";

// Sanity returns null for empty fields; the rest of the app expects them left out.
const dropNulls = <T>(value: unknown): T =>
  JSON.parse(JSON.stringify(value, (_, v) => (v === null ? undefined : v)));

async function fetchSanity<T>(query: string): Promise<T> {
  const result = await client!.fetch(query, {}, { next: { revalidate: 60, tags: [CACHE_TAG] } });
  return dropNulls<T>(result);
}

// Photos are served resized from Sanity's image CDN.
const photoUrl = (field: string, width: number) =>
  `"${field}": ${field}.asset->url + "?w=${width}&auto=format"`;

const SITE_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  name, shortName, school, founded, tagline, description, contactEmail,
  ${photoUrl("groupPhoto", 1600)}, socials, booking, history[]{ year, title, text }
}`);

const MEMBERS_QUERY = defineQuery(`*[_type == "member" && defined(slug.current)] | order(name asc){
  "slug": slug.current, name, voicePart, status, classYear, major, minor, job, hometown,
  execRole, ${photoUrl("photo", 800)}, bio, solos, funFact, favoriteArrangement, favoriteMemory
}`);

const EVENTS_QUERY = defineQuery(`*[_type == "event" && defined(date)]{
  "slug": coalesce(slug.current, _id), title, date, venue, description, ticketUrl, price
}`);

const RELEASES_QUERY = defineQuery(`*[_type == "release"]{
  title, kind, releaseDate, spotifyUrl, featured, ${photoUrl("cover", 240)},
  "tracks": coalesce(tracks[]{ title, "youtubeId": youtube, spotifyUrl, arranger, soloists }, [])
}`);

const VIDEOS_QUERY = defineQuery(`*[_type == "video" && defined(youtube)] | order(date desc){
  title, "youtubeId": youtube, date, arranger, soloists
}`);

const MERCH_QUERY = defineQuery(`*[_type == "merchItem"] | order(_createdAt asc){
  name, price, ${photoUrl("image", 800)}, buyUrl, sizes
}`);

export async function getSite(): Promise<Site> {
  if (!client) return localSite;
  const site = await fetchSanity<Partial<Site> | undefined>(SITE_QUERY);
  if (!site?.name) {
    throw new Error('No "Site settings" in Sanity yet. Run `npm run seed` or fill it in at /studio.');
  }
  return { ...site, socials: site.socials ?? {}, booking: site.booking ?? {}, history: site.history ?? [] } as Site;
}

export async function getMembers(): Promise<Member[]> {
  if (!client) return localMembers;
  return fetchSanity<Member[]>(MEMBERS_QUERY);
}

export async function getMember(slug: string) {
  return (await getMembers()).find((m) => m.slug === slug);
}

export async function getEvents(): Promise<Event[]> {
  if (!client) return localEvents.map((e) => ({ ...e, date: schoolTimeToIso(e.date) }));
  return fetchSanity<Event[]>(EVENTS_QUERY);
}

export async function getReleases(): Promise<Release[]> {
  const releases = client ? await fetchSanity<Release[]>(RELEASES_QUERY) : localReleases;
  return releases
    .map((r) => ({ ...r, tracks: r.tracks.map((t) => ({ ...t, youtubeId: youtubeId(t.youtubeId) })) }))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
}

export async function getVideos(): Promise<Video[]> {
  if (!client) return [];
  const videos = await fetchSanity<Video[]>(VIDEOS_QUERY);
  return videos.map((v) => ({ ...v, youtubeId: youtubeId(v.youtubeId)! }));
}

export async function getMerch(): Promise<MerchItem[]> {
  if (!client) return localMerch;
  return fetchSanity<MerchItem[]>(MERCH_QUERY);
}

// Editors can paste a whole YouTube link; the embed only needs the video ID.
function youtubeId(value?: string) {
  const v = value?.trim();
  if (!v) return undefined;
  return v.match(/(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/)?.[1] ?? v;
}

// ---- Derived lists ----

export const currentMembers = (members: Member[]) =>
  members.filter((m) => m.status === "current");

// Roles listed here come first, in this order; any other role follows alphabetically.
const execRoleOrder = ["President", "Music Director", "Business Manager"];
const execRank = (role = "") => {
  const i = execRoleOrder.indexOf(role);
  return i === -1 ? execRoleOrder.length : i;
};

export const execBoard = (members: Member[]) =>
  currentMembers(members)
    .filter((m) => m.execRole)
    .sort((a, b) => execRank(a.execRole) - execRank(b.execRole) || a.execRole!.localeCompare(b.execRole!));

export const alumni = (members: Member[]) =>
  members.filter((m) => m.status === "alumni").sort((a, b) => b.classYear - a.classYear);

const byDate = (a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime();

export const upcomingEvents = (events: Event[], now = new Date()) =>
  events.filter((e) => new Date(e.date) >= now).sort(byDate);

export const pastEvents = (events: Event[], now = new Date()) =>
  events.filter((e) => new Date(e.date) < now).sort(byDate).reverse();

// Anchor id for a release's block on the Music page, e.g. /music#after-the-ride.
export const releaseAnchor = (release: Release) =>
  release.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "release";

// Anchor id for the unreleased videos block on the Music page.
export const UNRELEASED_ANCHOR = "not-yet-released";

// Soloists are typed as plain names, so match them to members loosely.
const nameKey = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

// Soloist name → profile slug, for linking credits to member pages.
export type SoloistLinks = Record<string, string>;

export const soloistLinks = (members: Member[]): SoloistLinks =>
  Object.fromEntries(members.map((m) => [nameKey(m.name), m.slug]));

export const soloistSlug = (links: SoloistLinks, name: string) => links[nameKey(name)];

// Every recorded track (releases, then unreleased videos) this member solos on.
export const memberSoloTracks = (member: Member, releases: Release[], videos: Video[]) => {
  const solosOn = (t: { soloists?: string[] }) =>
    !!t.soloists?.some((s) => s && nameKey(s) === nameKey(member.name));
  return [
    ...releases.flatMap((release) =>
      release.tracks.filter(solosOn).map((track) => ({
        track,
        eyebrow: release.kind === "Single" ? `Single · ${release.releaseDate.slice(0, 4)}` : `${release.title} · ${release.kind}`,
      }))
    ),
    ...videos.filter(solosOn).map((video) => ({ track: video as Track, eyebrow: `Video · ${video.date.slice(0, 4)}` })),
  ];
};

// Song titles are typed loosely too: "Francesca" should match the "Francesca - Live"
// track, and a form answer like "Eagles Medley (Take It Easy)" the "Eagles Medley" one.
const songKey = (title: string) =>
  nameKey(title).replace(/\s*(?:[-–]\s*live|\(live\))$/, "");

export const sameSong = (typed: string, trackTitle: string) => {
  const key = songKey(typed);
  const track = songKey(trackTitle);
  return key === track || key.replace(/\s*\([^()]*\)$/, "") === track;
};

// Music page link for a song by title, e.g. a member's favorite arrangement.
export const songHref = (title: string, releases: Release[], videos: Video[]) => {
  const release = releases.find((r) => r.tracks.some((t) => sameSong(title, t.title)));
  if (release) return `/music#${releaseAnchor(release)}`;
  if (videos.some((v) => sameSong(title, v.title))) return `/music#${UNRELEASED_ANCHOR}`;
};

// Homepage order: pinned releases first, then newest.
export const homepageReleases = (releases: Release[]) =>
  [...releases].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

// Every track with the release it's on, in homepage order.
export const homepageTracks = (releases: Release[]) =>
  homepageReleases(releases).flatMap((release) => release.tracks.map((track) => ({ track, release })));
