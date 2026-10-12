// Adds or updates members in Sanity from the bio collection Google Form's CSV export
// (Sheet → File → Download → .csv):
//   npm run import-members -- "path/to/responses.csv"             (needs SANITY_API_WRITE_TOKEN in .env.local)
//   npm run import-members -- "path/to/responses.csv" --dry-run   (prints the changes, writes nothing)
// People already in Sanity (matched by profile URL or name) only get the fields they
// filled in on the form; everything else edited in the Studio is left alone.
// Headshots: form uploads are private, so put them in a folder named <slug>.jpg
// (e.g. aidan-guernsey.jpg) and pass --photos <folder>. Otherwise the script tries the
// Drive link, which only works if the file is shared "Anyone with the link".
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import { voiceParts } from "../lib/types.ts";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const photosArg = args.indexOf("--photos");
const photoDir = photosArg === -1 ? undefined : args[photosArg + 1];
const csvPath = args.find((a, i) => !a.startsWith("--") && (photosArg === -1 || i !== photosArg + 1));

if (!csvPath) {
  console.error('Usage: npm run import-members -- "responses.csv" [--photos <folder>] [--dry-run]');
  process.exit(1);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || (!dryRun && !token)) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first (see README).");
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });

// ---- CSV ----

function parseCsv(text) {
  const rows = [[]];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") rows.at(-1).push(field), (field = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      rows.at(-1).push(field), (field = ""), rows.push([]);
    } else field += c;
  }
  rows.at(-1).push(field);
  return rows.filter((r) => r.some((f) => f.trim()));
}

const [header, ...responses] = parseCsv((await readFile(csvPath, "utf8")).replace(/^﻿/, ""));
// Form questions may get reworded, so find columns by how they start.
const column = (start) => header.findIndex((h) => h.trim().toLowerCase().startsWith(start.toLowerCase()));
const columns = {
  name: column("Name"),
  classYear: column("Graduation Year"),
  yearJoined: column("Year Joined"),
  semesters: column("Number of Semesters"),
  status: column("Current Member or Alumni"),
  performedVP: column("Did you perform as a VP"),
  voicePart: column("Voice Part"),
  execRole: column("Exec Role (current)"),
  pastExecRoles: column("Exec Role(s)"),
  major: column("Major"),
  minor: column("Minor"),
  job: column("Current Job"),
  hometown: column("Hometown"),
  headshot: column("Headshot"),
  bio: column("Bio"),
  solos: column("Solos"),
  funFact: column("Fun Fact"),
  favoriteArrangement: column("Favorite S2S Arrangement"),
  favoriteMemory: column("Favorite S2S Memory"),
};
for (const [key, i] of Object.entries(columns)) if (i === -1) console.warn(`No "${key}" column in the CSV; skipping it.`);

const toSlug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nameKey = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
const toNumber = (s) => (/^\d+$/.test(s) ? Number(s) : undefined);
const toYesNo = (s) => (/^y/i.test(s) ? true : /^n/i.test(s) ? false : undefined);
// "A, B (with, commas), C" or one per line → ["A", "B (with, commas)", "C"]
const splitList = (s) => s.split(/\n|,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean);

// ---- Photos ----

const localPhotos = photoDir ? await readdir(photoDir) : [];
async function photoFile(slug, driveLink) {
  const local = localPhotos.find((f) => path.parse(f).name.toLowerCase() === slug);
  if (local) return { data: await readFile(path.join(photoDir, local)), filename: local };
  const id = driveLink?.match(/[?&]id=([\w-]+)|\/d\/([\w-]+)/)?.slice(1).find(Boolean);
  if (!id) return;
  const res = await fetch(`https://drive.google.com/uc?export=download&id=${id}`);
  if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) return;
  return { data: Buffer.from(await res.arrayBuffer()), filename: `${slug}.jpg` };
}

// ---- Import ----

const existing = await client.fetch(`*[_type == "member"]{ _id, name, "slug": slug.current }`);
const problems = [];
const tx = client.transaction();

for (const row of responses) {
  const get = (key) => (columns[key] === -1 ? "" : (row[columns[key]] ?? "").trim());
  const name = get("name").replace(/\s+/g, " ");
  if (!name) continue;
  const slug = toSlug(name);
  const warn = (msg) => problems.push(`${name}: ${msg}`);

  const status = /alum/i.test(get("status")) ? "alumni" : "current";
  const voicePart = voiceParts.find((v) => v.toLowerCase() === get("voicePart").toLowerCase());
  if (get("voicePart") && !voicePart) warn(`voice part "${get("voicePart")}" isn't one of ${voiceParts.join(", ")}; not set.`);
  const classYear = Number.parseInt(get("classYear"), 10);
  let execRole = get("execRole");
  if (execRole && status === "alumni") warn(`alumni aren't on the exec board, so "${execRole}" wasn't set.`), (execRole = "");

  const fields = Object.fromEntries(
    Object.entries({
      name,
      status,
      voicePart,
      classYear: Number.isNaN(classYear) ? undefined : classYear,
      yearJoined: toNumber(get("yearJoined")),
      semesters: toNumber(get("semesters")),
      performedVP: toYesNo(get("performedVP")),
      execRole,
      pastExecRoles: get("pastExecRoles") ? splitList(get("pastExecRoles")) : undefined,
      major: get("major"),
      minor: get("minor"),
      job: get("job"),
      hometown: get("hometown"),
      bio: get("bio"),
      solos: get("solos") ? splitList(get("solos")) : undefined,
      funFact: get("funFact"),
      favoriteArrangement: get("favoriteArrangement"),
      favoriteMemory: get("favoriteMemory"),
    }).filter(([, v]) => v !== undefined && v !== "")
  );

  const photo = await photoFile(slug, get("headshot"));
  if (photo && !dryRun) {
    const asset = await client.assets.upload("image", photo.data, { filename: photo.filename });
    fields.photo = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  } else if (photo) fields.photo = `<upload ${photo.filename}>`;
  else if (get("headshot")) warn(`couldn't fetch the headshot (${get("headshot")}). Save it as ${slug}.jpg and re-run with --photos <folder>, or add it in /studio.`);

  const match = existing.find((m) => m.slug === slug || nameKey(m.name ?? "") === nameKey(name));
  if (match) {
    console.log(`Updating ${name} (/members/${match.slug}): ${Object.keys(fields).join(", ")}`);
    tx.patch(match._id, (p) => p.set(fields));
    // Drafts would hide the update in the Studio, so keep them in step too.
    tx.patch(`drafts.${match._id}`, (p) => p.set(fields));
  } else {
    for (const required of ["voicePart", "classYear", "bio"]) if (!(required in fields)) warn(`missing ${required}; fill it in at /studio.`);
    console.log(`Adding ${name} as ${status === "alumni" ? "an alum" : "a current member"} (/members/${slug})`);
    tx.createIfNotExists({ _id: `member-${slug}`, _type: "member", slug: { _type: "slug", current: slug }, ...fields });
  }
  if (dryRun) console.log(JSON.stringify(fields, null, 2));
}

if (problems.length) console.warn(`\nCheck these:\n- ${problems.join("\n- ")}`);
if (dryRun) console.log("\nDry run, nothing written.");
else {
  // Patching a draft that doesn't exist fails the whole transaction, so drop those first.
  const drafts = new Set(await client.fetch(`*[_id in path("drafts.**") && _type == "member"]._id`));
  const mutations = tx.toJSON().filter((m) => !m.patch || !m.patch.id.startsWith("drafts.") || drafts.has(m.patch.id));
  await client.mutate(mutations);
  console.log(`\nDone. The site picks up changes within a minute (or right away if the publish webhook is set up).`);
}
