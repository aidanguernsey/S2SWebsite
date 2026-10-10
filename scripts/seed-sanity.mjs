// Copies the starter data in content/ (and the photos it points to in public/)
// into Sanity. Run once after creating the Sanity project:
//   npm run seed              (needs SANITY_API_WRITE_TOKEN in .env.local)
//   npm run seed -- --dry-run (prints the documents, writes nothing)
// It refuses to run if Sanity already has content, so it can't overwrite
// edits made in the Studio. Pass --force to overwrite anyway.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import { site } from "../content/site.ts";
import { members } from "../content/members.ts";
import { events } from "../content/events.ts";
import { releases } from "../content/releases.ts";
import { merch } from "../content/merch.ts";
import { schoolTimeToIso } from "../lib/time.ts";

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!dryRun && (!projectId || !token)) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first (see README).");
  process.exit(1);
}

const client = dryRun ? null : createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });

const toId = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const slug = (current) => ({ _type: "slug", current });
// Sanity lists need a unique _key on each object in an array.
const keyed = (items) => items.map((item, i) => ({ _key: `k${i}`, ...item }));
// Leave out empty values ("" or undefined) instead of storing them.
const compact = (doc) => Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined && v !== ""));

// Uploads a file from public/ (e.g. "/members/jane.jpg") and returns an image field.
const uploaded = new Map();
async function image(publicPath) {
  if (!publicPath) return undefined;
  if (dryRun) return `<upload public${publicPath}>`;
  if (!uploaded.has(publicPath)) {
    const file = path.join("public", publicPath);
    const asset = await client.assets.upload("image", await readFile(file), { filename: path.basename(file) });
    console.log(`Uploaded ${file}`);
    uploaded.set(publicPath, asset._id);
  }
  return { _type: "image", asset: { _type: "reference", _ref: uploaded.get(publicPath) } };
}

if (!dryRun && !force) {
  const existing = await client.fetch(`count(*[_type in ["siteSettings", "member", "event", "release", "merchItem"]])`);
  if (existing > 0) {
    console.error(`Sanity already has ${existing} documents. Re-run with --force to overwrite the seeded ones.`);
    process.exit(1);
  }
}

const docs = [
  compact({
    _id: "siteSettings",
    _type: "siteSettings",
    ...site,
    groupPhoto: await image(site.groupPhoto),
    history: keyed(site.history),
  }),
  ...(await Promise.all(
    members.map(async (m) =>
      compact({ _id: `member-${m.slug}`, _type: "member", ...m, slug: slug(m.slug), photo: await image(m.photo) })
    )
  )),
  ...events.map((e) =>
    compact({ _id: `event-${e.slug}`, _type: "event", ...e, slug: slug(e.slug), date: schoolTimeToIso(e.date) })
  ),
  ...releases.map((r) =>
    compact({
      _id: `release-${toId(`${r.title}-${r.releaseDate}`)}`,
      _type: "release",
      ...r,
      tracks: keyed(r.tracks.map(({ youtubeId, ...t }) => compact({ _type: "track", ...t, youtube: youtubeId }))),
    })
  ),
  ...(await Promise.all(
    merch.map(async (p) => compact({ _id: `merch-${toId(p.name)}`, _type: "merchItem", ...p, image: await image(p.image) }))
  )),
];

if (dryRun) {
  console.log(JSON.stringify(docs, null, 2));
  console.log(`\n${docs.length} documents (dry run, nothing written).`);
} else {
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();
  console.log(`Seeded ${docs.length} documents into ${projectId}/${dataset}. Open /studio to edit them.`);
}
