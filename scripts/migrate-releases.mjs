// One-off: converts the old one-document-per-song releases in Sanity into
// albums / EPs / singles that each hold their tracks, then deletes the old documents.
//   node --env-file=.env.local scripts/migrate-releases.mjs --dry-run
//   node --env-file=.env.local scripts/migrate-releases.mjs
// Each new release lists the old documents (by title) that become its tracks,
// in track-list order, plus any old document for the release itself (`replaces`).
// Links, credits, and "Pin to homepage" are carried over as-is.
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || (!dryRun && !token)) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first.");
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });

const plan = [
  {
    _id: "release-more-each-day",
    title: "More Each Day",
    kind: "Album",
    releaseDate: "2026-02-13",
    spotifyUrl: "https://open.spotify.com/album/1Kkx4l0pdL4JjEWfsUFg1Z",
    tracks: [
      // Not on the site yet: the live version from the album.
      {
        title: "End of Beginning - Live",
        spotifyUrl: "https://open.spotify.com/track/1NsBsNznfjMjj38cGK3nu1",
        soloists: ["Tom Terrell"],
      },
      "Eagles Medley - Live",
      "Endlessly - Live",
      "Saturn - Live",
      "Birds of a Feather - Live",
      "The Weeknd Medley - Live",
      "Petrified - Live",
    ],
  },
  {
    _id: "release-after-the-ride",
    title: "After the Ride",
    kind: "EP",
    releaseDate: "2026-08-28",
    spotifyUrl: "https://open.spotify.com/album/1PddP3VY6aDAsx302OtnvT",
    replaces: ["After the Ride"],
    tracks: ["Joji Medley - Live", "Francesca - Live", "Ophelia - Live", "Caravan - Live", "Stay - Live", "Vertigo - Live"],
  },
  {
    _id: "release-end-of-beginning",
    title: "End of Beginning",
    kind: "Single",
    spotifyUrl: "https://open.spotify.com/album/5mbO1W2CRfVd1ojCuRwAhK",
    tracks: ["End of Beginning"],
  },
  // Older releases from Spotify that weren't on the site yet. Soloists are the
  // featured artists Spotify credits on each track.
  {
    _id: "release-holidays-at-hall",
    title: "Holidays at Hall",
    kind: "Album",
    releaseDate: "2025-11-28",
    spotifyUrl: "https://open.spotify.com/album/1gehYnk3Ihsf4QlkcJFxIa",
    tracks: [
      { title: "Cold December Night", spotifyUrl: "https://open.spotify.com/track/13HPYMPKpYAfsjcJSU2osf", soloists: ["Ty Schaab"] },
      { title: "(It Must've Been Ol') Santa Claus", spotifyUrl: "https://open.spotify.com/track/7tshp1HYBn6oBZIPs3HwQn", soloists: ["Kyle Baesman"] },
      { title: "Please Come Home For Christmas", spotifyUrl: "https://open.spotify.com/track/5KZM2b00tOBpqBBEGhtndY", soloists: ["Kyle Baesman"] },
      { title: "Santa Claus is Comin' to Town", spotifyUrl: "https://open.spotify.com/track/4CmC7WjurEip5lSEuae1UR", soloists: ["Ben Poe"] },
      { title: "Wonderful Christmastime + 10/10", spotifyUrl: "https://open.spotify.com/track/6wQ4tv5A2C3AVfFPGKxs0e", soloists: ["Aidan McKeon", "Matthew Morris"] },
      { title: "Rockin' Around the Christmas Tree/Cold as Ice", spotifyUrl: "https://open.spotify.com/track/7q6kieFlx2YQdcKrKmnPFT", soloists: ["Nick Baesman", "Matthew Morris"] },
      { title: "Where Are You Christmas", spotifyUrl: "https://open.spotify.com/track/77w7qkFHt0H7br3OZbYU6U", soloists: ["Brandon Small"] },
      { title: "The Snow Miser/Heat Miser Song", spotifyUrl: "https://open.spotify.com/track/1l3Qhr9FA7blV0BDQuGq3c", soloists: ["Ben Poe", "Gordon Taylor"] },
    ],
  },
  {
    _id: "release-stuck-in-reverse",
    title: "Stuck In Reverse",
    kind: "Album",
    releaseDate: "2025-10-03",
    spotifyUrl: "https://open.spotify.com/album/4RyBy6wUnLeRPXBWmgK0YG",
    tracks: [
      { title: "Bill Withers Medley", spotifyUrl: "https://open.spotify.com/track/1EliobJQu5bGedPnFdgfsC" },
      { title: "Misery", spotifyUrl: "https://open.spotify.com/track/1uCKrxscj2gcWacLO4Lro6", soloists: ["Wes Payne"] },
      { title: "Evergreen", spotifyUrl: "https://open.spotify.com/track/0KrmEnrqHGO998I33lkh2x", soloists: ["Ty Schaab"] },
      { title: "Sweet Child O' Mine", spotifyUrl: "https://open.spotify.com/track/3FFnpLzQZX7q65SNBPB2ZV", soloists: ["Jake Juenger"] },
      { title: "What More Can I Say", spotifyUrl: "https://open.spotify.com/track/38sl2FCs5BrQnbqDv85RzT", soloists: ["Brad Mraz"] },
      { title: "Misnomer", spotifyUrl: "https://open.spotify.com/track/4qj2j7pEhR0biRgrNaVDFH", soloists: ["Ty Schaab"] },
      { title: "Disney Medley", spotifyUrl: "https://open.spotify.com/track/6Y1uPzySNkOM8Q5IeuoDLW" },
      { title: "Fix You", spotifyUrl: "https://open.spotify.com/track/2dxWQ9uCfB5tphJQPAJb28", soloists: ["Jake Juenger", "Ty Schaab", "Aaron Chavez"] },
    ],
  },
  {
    _id: "release-homegrown",
    title: "Homegrown",
    kind: "EP",
    releaseDate: "2023-09-16",
    spotifyUrl: "https://open.spotify.com/album/7fzyKdTpsRJNrmdAa1CWRk",
    tracks: [
      { title: "Music for a Sushi Restaurant", spotifyUrl: "https://open.spotify.com/track/2V0bBdfmbZhGugDq4GQgOT", soloists: ["Brad Mraz"] },
      { title: "Magic", spotifyUrl: "https://open.spotify.com/track/2wFdaNDAantT7PSmku0IRr" },
      { title: "Loose", spotifyUrl: "https://open.spotify.com/track/7pORRqENmf2wy6b15l5NEs", soloists: ["Brad Mraz"] },
      { title: "Nirvana Medley", spotifyUrl: "https://open.spotify.com/track/4gsLhRkPbDoBBczO6U4Fzm" },
      { title: "I'm Still Standing", spotifyUrl: "https://open.spotify.com/track/3veLiuQ7qdx5npXw7p1ahW", soloists: ["Jake Juenger"] },
    ],
  },
  {
    _id: "release-beverly-blues-live",
    title: "Beverly Blues (Live)",
    kind: "Single",
    releaseDate: "2022-07-06",
    spotifyUrl: "https://open.spotify.com/album/4f52eWduNYZLxLcg9HHc8Y",
    tracks: [
      { title: "Beverly Blues - Live", spotifyUrl: "https://open.spotify.com/track/30y3Ff4ezVVuH9nROeOMvG", soloists: ["Jake Juenger"] },
    ],
  },
  {
    _id: "release-the-joke-live",
    title: "The Joke (Live)",
    kind: "Single",
    releaseDate: "2022-05-24",
    spotifyUrl: "https://open.spotify.com/album/6LeAenuygLrqeLfWRYUq7R",
    tracks: [
      { title: "The Joke - Live", spotifyUrl: "https://open.spotify.com/track/60jZ9BqQdaWC4bMX04hROA", soloists: ["Aidan McKeon"] },
    ],
  },
  {
    _id: "release-4-songs-we-think-you-ll-really-like",
    title: "4 Songs We Think You'll Really Like",
    kind: "EP",
    releaseDate: "2021-02-22",
    spotifyUrl: "https://open.spotify.com/album/10fVqZ4QlVqKRCYbH53N0Y",
    tracks: [
      { title: "Chromatica Medley", spotifyUrl: "https://open.spotify.com/track/484AIRv82a4C329R2oONbR" },
      { title: "Hallucinogenics", spotifyUrl: "https://open.spotify.com/track/7KQL3UJPSOglXS3Bc6EdC7", soloists: ["Kyle Baesman"] },
      { title: "As", spotifyUrl: "https://open.spotify.com/track/4Cob0ATC5cuRSbtCUYHz06", soloists: ["Aidan McKeon"] },
      { title: "Proud Mary", spotifyUrl: "https://open.spotify.com/track/2sKJAuNBhgWkwRDwpcvSdc", soloists: ["Ben Capella", "Brandon Small"] },
    ],
  },
  {
    _id: "release-4-wooster-place",
    title: "4 Wooster Place",
    kind: "Album",
    releaseDate: "2020-12-04",
    spotifyUrl: "https://open.spotify.com/album/1m8FLe47nkhWyBRw9AX4WR",
    tracks: [
      { title: "Film Medley", spotifyUrl: "https://open.spotify.com/track/1gmy1zlYW4e77nCbWWoKcN" },
      { title: "bad guy", spotifyUrl: "https://open.spotify.com/track/44G0nIpSIgjQOKZhSxZ0TR", soloists: ["Jeremiah Hunter"] },
      { title: "Movement", spotifyUrl: "https://open.spotify.com/track/3HTZVsP4BMGWLDDHPAQnCm", soloists: ["Jeffrey Parker Mayo"] },
      { title: "Rocket Man", spotifyUrl: "https://open.spotify.com/track/6iRs0VsY7WrgtJMazINZzG", soloists: ["Adam Guadalupe"] },
      { title: "Don't Start Now", spotifyUrl: "https://open.spotify.com/track/2INx2HgASRR5G7dXvYQM9G", soloists: ["Aidan McKeon"] },
      { title: "What Is Love?", spotifyUrl: "https://open.spotify.com/track/0TBE6ojgUPPBc2O5u9wDOV", soloists: ["Brandon Small"] },
      { title: "Mr. Brightside", spotifyUrl: "https://open.spotify.com/track/0KoBdaI4WBJPfRr5DO7zIZ", soloists: ["Nick Baesman"] },
      { title: "Sucker", spotifyUrl: "https://open.spotify.com/track/51ZWxlJu4SpK7adpuNRPSH" },
      { title: "Shrek Medley", spotifyUrl: "https://open.spotify.com/track/2IZZgGRCcw5Zk3N7TmQgwp" },
      { title: "Carry on Wayward Son - Live at Hall Auditorium", spotifyUrl: "https://open.spotify.com/track/2K9E8Wt8PBclRImjZUeWmn", soloists: ["Will Piotrkowski"] },
    ],
  },
  {
    _id: "release-don-t-start-now",
    title: "Don't Start Now",
    kind: "Single",
    releaseDate: "2020-11-21",
    spotifyUrl: "https://open.spotify.com/album/7bYodaGLyr042ZQdtHCJcW",
    tracks: [
      { title: "Don't Start Now", spotifyUrl: "https://open.spotify.com/track/2gZMvsIbHWYOjkElhqdPoQ", soloists: ["Aidan McKeon"] },
    ],
  },
  {
    _id: "release-movement",
    title: "Movement",
    kind: "Single",
    releaseDate: "2018-01-01",
    spotifyUrl: "https://open.spotify.com/album/4UVAJPleZTXaVzTJp03HYN",
    tracks: [
      { title: "Movement", spotifyUrl: "https://open.spotify.com/track/5MswLzVGf6vSO5gPzEvKxh", soloists: ["Jeffrey Parker Mayo"] },
    ],
  },
  {
    _id: "release-ghost-town",
    title: "Ghost Town",
    kind: "Album",
    releaseDate: "2016-10-21",
    spotifyUrl: "https://open.spotify.com/album/6bPBheiZBrhItwMbA3rH3Y",
    tracks: [
      { title: "Brother", spotifyUrl: "https://open.spotify.com/track/3xT2OqJ51yHRZyHBhwFRsH" },
      { title: "Cry Me a River", spotifyUrl: "https://open.spotify.com/track/46vkU0yTbc3EegvoLpUW4O" },
      { title: "Can't Feel My Face", spotifyUrl: "https://open.spotify.com/track/78avRqBlNaQ62Q6mDBcIc4" },
      { title: "Runaway Baby", spotifyUrl: "https://open.spotify.com/track/1rxZTnLwkjHqYbZ1BjrQB6" },
      { title: "I See Fire / Misty Mountains", spotifyUrl: "https://open.spotify.com/track/5nvkH6q6TezpvKTfZVQTND" },
      { title: "Ridin' Solo / Bittersweet Symphony", spotifyUrl: "https://open.spotify.com/track/7cesZ5A2eRBm25Ed1yUv7v" },
      { title: "Alive / Chandelier", spotifyUrl: "https://open.spotify.com/track/1BGKPTzfogI1H9oqoL3kSD" },
      { title: "Victorious", spotifyUrl: "https://open.spotify.com/track/61583T7JcUis6gV7HEZpU4" },
    ],
  },
  {
    _id: "release-game-over",
    title: "Game Over",
    kind: "Album",
    releaseDate: "2014-10-25",
    spotifyUrl: "https://open.spotify.com/album/2mPRMAA55o3aV9IlngwUl5",
    tracks: [
      { title: "Wagon Wheel", spotifyUrl: "https://open.spotify.com/track/6u9xLldDVljBlSZ02MKu5m" },
      { title: "Latch", spotifyUrl: "https://open.spotify.com/track/0ZkHcCmdGNIlpr5sTgToLe" },
      { title: "Keep Your Head Up", spotifyUrl: "https://open.spotify.com/track/6OqyFsROAnMfZP9G9uXtqO" },
      { title: "Beyoncé", spotifyUrl: "https://open.spotify.com/track/0ucGSO1xYAgqKwqOJw47c7" },
      { title: "Slow Down", spotifyUrl: "https://open.spotify.com/track/553okV6KMX3eqcBJdjOEgk" },
      { title: "Hey Ya", spotifyUrl: "https://open.spotify.com/track/5fMrC2QMVFwmBU9zMwda59" },
      { title: "EDM", spotifyUrl: "https://open.spotify.com/track/0hl8LfC1DcEofoMRCHtmsx" },
    ],
  },
];

const old = await client.fetch(`*[_type == "release" && !defined(tracks)]`);
const used = new Set();
const pick = (title) => {
  const matches = old.filter((d) => d.title === title);
  if (!matches.length) throw new Error(`No existing release titled "${title}"`);
  // "Stay - Live" exists twice; prefer the one carrying the most info.
  const doc = matches.sort((a, b) => Object.keys(b).length - Object.keys(a).length)[0];
  matches.forEach((d) => used.add(d._id));
  return doc;
};

// Spelling fixes for names carried over from the old documents.
const nameFixes = { "Ty Scaab": "Ty Schaab" };

const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && !v.length)));

const docs = plan.map(({ tracks, replaces = [], ...release }) => {
  const sources = tracks.map((t) => (typeof t === "string" ? pick(t) : t));
  const first = sources.find((s) => s._id);
  const replaced = replaces.map(pick);
  return compact({
    _type: "release",
    ...release,
    releaseDate: release.releaseDate ?? first.releaseDate,
    featured: [...sources, ...replaced].some((s) => s.featured) || undefined,
    tracks: sources.map((s, i) =>
      compact({
        _key: `t${i}`,
        _type: "track",
        title: s.title,
        youtube: s.youtube,
        spotifyUrl: s.spotifyUrl,
        arranger: s.arranger,
        soloists: s.soloists?.filter(Boolean).map((name) => nameFixes[name] ?? name),
      })
    ),
  });
});

const leftover = old.filter((d) => !used.has(d._id));
if (leftover.length) {
  console.error("These releases aren't assigned to an album/EP/single; add them to the plan first:");
  leftover.forEach((d) => console.error(`  - ${d.title} (${d._id})`));
  process.exitCode = 1;
} else if (dryRun) {
  console.log(JSON.stringify(docs, null, 2));
  console.log(`\nWould create ${docs.length} releases and delete ${used.size} old documents (dry run).`);
} else {
  const tx = client.transaction();
  docs.forEach((d) => tx.createOrReplace(d));
  // Also remove any unpublished drafts of the old documents.
  used.forEach((id) => tx.delete(id).delete(`drafts.${id}`));
  await tx.commit();
  console.log(`Created ${docs.length} releases and deleted ${used.size} old documents.`);
}
