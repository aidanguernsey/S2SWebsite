// Every morning, adds new bio collection form submissions to the website:
// creates (or updates) their member profile in Sanity, adds them to the backup
// in content/members.json on GitHub, and emails NOTIFY_EMAIL a list of who to
// add a headshot for in the Studio.
//
// Setup (see README → "Member bio form"):
// 1. In the form's response Sheet, open Extensions → Apps Script and paste this
//    file into a new script file (or Code.gs).
// 2. Project Settings → Script Properties: add SANITY_TOKEN and GITHUB_TOKEN.
// 3. Run `setup` once from the editor and approve the permissions prompt.
//
// Run `syncMembers` from the editor any time to import right away.
// Re-submitted (edited) responses are imported again with the changes.

const SANITY_PROJECT_ID = "mydm47og"; // same as NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = "production";
const GITHUB_REPO = "aidanguernsey/S2SWebsite";
const GITHUB_BRANCH = "main";
const BACKUP_PATH = "content/members.json";
const SITE_URL = "https://REPLACE_WITH_YOUR_SITE"; // for Studio links in the email
const NOTIFY_EMAIL = "aidan.guernsey@gmail.com";
const RUN_AT_HOUR = 7; // 7–8am in the script's time zone (Project Settings)

// Must match voiceParts in lib/types.ts.
const VOICE_PARTS = ["Tenor I", "Tenor II", "Baritone", "Bass", "Vocal Percussion"];

// Form questions may get reworded, so columns are found by how they start.
const COLUMNS = {
  timestamp: "Timestamp",
  name: "Name",
  classYear: "Graduation Year",
  status: "Current Member or Alumni",
  voicePart: "Voice Part",
  execRole: "Exec Role (current)",
  pastExecRoles: "Exec Role(s)",
  major: "Major",
  minor: "Minor",
  job: "Current Job",
  hometown: "Hometown",
  headshot: "Headshot",
  bio: "Bio",
  solos: "Solos",
  funFact: "Fun Fact",
  favoriteArrangement: "Favorite S2S Arrangement",
  favoriteMemory: "Favorite S2S Memory",
};

function setup() {
  for (const t of ScriptApp.getProjectTriggers()) {
    if (t.getHandlerFunction() === "syncMembers") ScriptApp.deleteTrigger(t);
  }
  ScriptApp.newTrigger("syncMembers").timeBased().everyDays(1).atHour(RUN_AT_HOUR).create();
  secret("SANITY_TOKEN");
  secret("GITHUB_TOKEN");
  Logger.log("Scheduled daily at %s:00 (%s).", RUN_AT_HOUR, Session.getScriptTimeZone());
}

function syncMembers() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) return;
  try {
    // Row number → timestamp of the version already imported.
    const props = PropertiesService.getScriptProperties();
    const imported = JSON.parse(props.getProperty("IMPORTED") || "{}");

    const submissions = readSheet().filter((s) => imported[s.row] !== s.timestamp);
    if (!submissions.length) return;

    const results = importToSanity(submissions);
    updateBackup(results);
    sendEmail(results);

    for (const s of submissions) imported[s.row] = s.timestamp;
    props.setProperty("IMPORTED", JSON.stringify(imported));
  } finally {
    lock.releaseLock();
  }
}

// ---- Sheet ----

function readSheet() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheets()
      .find((s) => s.getFormUrl()) || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const [header, ...rows] = sheet.getDataRange().getDisplayValues();
  const index = {};
  for (const [key, start] of Object.entries(COLUMNS)) {
    index[key] = header.findIndex((h) => h.trim().toLowerCase().startsWith(start.toLowerCase()));
  }
  return rows
    .map((row, i) => {
      const get = (key) => (index[key] === -1 ? "" : String(row[index[key]] || "").trim());
      return { row: i + 2, timestamp: get("timestamp"), get };
    })
    .filter((s) => s.get("name"));
}

const toSlug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nameKey = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
// "A, B (with, commas), C" → ["A", "B (with, commas)", "C"]
const splitList = (s) => s.split(/,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean);

// Same mapping as scripts/import-members.mjs.
function toFields({ get }, warn) {
  const name = get("name").replace(/\s+/g, " ");
  const status = /alum/i.test(get("status")) ? "alumni" : "current";
  const voicePart = VOICE_PARTS.find((v) => v.toLowerCase() === get("voicePart").toLowerCase());
  if (get("voicePart") && !voicePart) warn(`voice part "${get("voicePart")}" isn't one of ${VOICE_PARTS.join(", ")}; not set.`);
  const classYear = parseInt(get("classYear"), 10);
  let execRole = get("execRole");
  if (execRole && status === "alumni") warn(`alumni aren't on the exec board, so "${execRole}" wasn't set.`), (execRole = "");

  return Object.fromEntries(
    Object.entries({
      name,
      status,
      voicePart,
      classYear: isNaN(classYear) ? undefined : classYear,
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
}

// ---- Sanity ----

function sanity(path, payload) {
  const res = UrlFetchApp.fetch(`https://${SANITY_PROJECT_ID}.api.sanity.io/v2025-10-01/data/${path}`, {
    method: payload ? "post" : "get",
    contentType: "application/json",
    payload: payload && JSON.stringify(payload),
    headers: { Authorization: `Bearer ${secret("SANITY_TOKEN")}` },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) throw new Error(`Sanity request failed: ${res.getContentText()}`);
  return JSON.parse(res.getContentText());
}

function importToSanity(submissions) {
  const query = `{
    "members": *[_type == "member" && !(_id in path("drafts.**"))]{ _id, name, "slug": slug.current, "hasPhoto": defined(photo) },
    "drafts": *[_type == "member" && _id in path("drafts.**")]._id
  }`;
  const { members, drafts } = sanity(`query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`).result;
  const mutations = [];

  const results = submissions.map((submission) => {
    const problems = [];
    const fields = toFields(submission, (msg) => problems.push(msg));
    const slug = toSlug(fields.name);
    const match = members.find((m) => m.slug === slug || nameKey(m.name || "") === nameKey(fields.name));
    if (match) {
      mutations.push({ patch: { id: match._id, set: fields } });
      // Drafts would hide the update in the Studio, so keep them in step too.
      if (drafts.includes(`drafts.${match._id}`)) mutations.push({ patch: { id: `drafts.${match._id}`, set: fields } });
    } else {
      for (const required of ["voicePart", "classYear", "bio"]) {
        if (!(required in fields)) problems.push(`missing ${required}; fill it in at /studio.`);
      }
      mutations.push({
        createIfNotExists: { _id: `member-${slug}`, _type: "member", slug: { _type: "slug", current: slug }, ...fields },
      });
    }
    return {
      id: match ? match._id : `member-${slug}`,
      slug: match ? match.slug : slug,
      fields,
      isNew: !match,
      needsPhoto: !(match && match.hasPhoto),
      headshot: submission.get("headshot"),
      problems,
    };
  });

  sanity(`mutate/${SANITY_DATASET}`, { mutations });
  return results;
}

// ---- Backup (content/members.json on GitHub) ----

function github(method, payload) {
  const res = UrlFetchApp.fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${BACKUP_PATH}` + (payload ? "" : `?ref=${GITHUB_BRANCH}`),
    {
      method,
      contentType: "application/json",
      payload: payload && JSON.stringify(payload),
      headers: { Authorization: `Bearer ${secret("GITHUB_TOKEN")}`, Accept: "application/vnd.github+json" },
      muteHttpExceptions: true,
    }
  );
  if (res.getResponseCode() >= 300) throw new Error(`GitHub ${method} ${BACKUP_PATH} failed: ${res.getContentText()}`);
  return JSON.parse(res.getContentText());
}

function updateBackup(results) {
  const file = github("get");
  const members = JSON.parse(Utilities.newBlob(Utilities.base64Decode(file.content)).getDataAsString());
  for (const { slug, fields } of results) {
    const i = members.findIndex((m) => m.slug === slug);
    // Keep anything the backup already has (like a photo path) that the form doesn't cover.
    if (i === -1) members.push({ slug, ...fields });
    else members[i] = { ...members[i], ...fields, slug };
  }
  github("put", {
    message: `Add form submissions to member backup: ${results.map((r) => r.fields.name).join(", ")}`,
    content: Utilities.base64Encode(JSON.stringify(members, null, 2) + "\n", Utilities.Charset.UTF_8),
    sha: file.sha,
    branch: GITHUB_BRANCH,
  });
}

// ---- Email ----

function sendEmail(results) {
  const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const needPhotos = results.filter((r) => r.needsPhoto);
  const items = results.map((r) => {
    const studio = `${SITE_URL}/studio/intent/edit/id=${encodeURIComponent(r.id)};type=member`;
    const lines = [
      `<b>${escape(r.fields.name)}</b> — ${r.isNew ? "added" : "updated"} as ${r.fields.status === "alumni" ? "an alum" : "a current member"}`,
      `<a href="${studio}">Open in Studio</a> · <a href="${SITE_URL}/members/${r.slug}">View profile</a>`,
    ];
    if (r.needsPhoto) {
      lines.push(r.headshot ? `Needs a photo: <a href="${escape(r.headshot)}">their headshot upload</a>` : "Needs a photo (none uploaded on the form).");
    }
    for (const p of r.problems) lines.push(`⚠ ${escape(p)}`);
    return `<li style="margin-bottom:12px">${lines.join("<br>")}</li>`;
  });

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: needPhotos.length
      ? `Add ${needPhotos.length === 1 ? "a photo" : `${needPhotos.length} photos`} in Studio: ${needPhotos.map((r) => r.fields.name).join(", ")}`
      : `Member profiles updated: ${results.map((r) => r.fields.name).join(", ")}`,
    htmlBody:
      `<p>New bio form submissions were added to the website and the backup.` +
      (needPhotos.length ? ` Download each headshot, then upload it to the Photo field in Studio and click Publish.` : "") +
      `</p><ul>${items.join("")}</ul>`,
  });
}

function secret(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error(`Add ${name} in Project Settings → Script Properties.`);
  return value;
}
