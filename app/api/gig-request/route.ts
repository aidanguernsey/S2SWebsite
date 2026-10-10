import { NextResponse } from "next/server";

type GigRequest = {
  name: string;
  email: string;
  eventType?: string;
  date?: string;
  time?: string;
  location?: string;
  details?: string;
  website?: string; // honeypot
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

// <input type="time"> sends 24-hour "19:30"; show it as "7:30 PM".
const formatTime = (s: string) => {
  const m = /^(\d\d):(\d\d)/.exec(s);
  if (!m) return "";
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
};

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data: GigRequest = {
    name: clean(raw.name, 200),
    email: clean(raw.email, 200),
    eventType: clean(raw.eventType, 100),
    date: clean(raw.date, 20),
    time: formatTime(clean(raw.time, 20)),
    location: clean(raw.location, 300),
    details: clean(raw.details),
    website: clean(raw.website, 200),
  };

  // Bots fill the hidden field; pretend it worked and drop it.
  if (data.website) return NextResponse.json({ ok: true });

  if (!data.name || !isEmail(data.email)) {
    return NextResponse.json(
      { error: "Please include your name and a valid email." },
      { status: 400 }
    );
  }

  const text = [
    `New gig request from ${data.name} <${data.email}>`,
    `Event type: ${data.eventType || "—"}`,
    `Date: ${data.date || "—"}`,
    `Time: ${data.time || "—"}`,
    `Location: ${data.location || "—"}`,
    "",
    data.details || "(no details)",
  ].join("\n");

  const deliveries = [sendEmail(data, text), logToSheet(data)].filter(
    (d): d is Promise<boolean> => d !== null
  );

  if (deliveries.length === 0) {
    // Development fallback: neither email nor sheet configured yet.
    console.log("[gig-request]\n" + text);
    return NextResponse.json({ ok: true });
  }

  // The request is safe as long as at least one destination got it.
  const results = await Promise.all(deliveries);
  if (!results.some(Boolean)) {
    return NextResponse.json(
      { error: "We couldn't send your request. Please email us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

// Each helper returns null when it isn't configured, otherwise whether it worked.

function sendEmail(data: GigRequest, text: string): Promise<boolean> | null {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.GIG_REQUEST_TO;
  if (!apiKey || !to) return null;
  // onboarding@resend.dev only delivers to your own Resend account email;
  // set GIG_REQUEST_FROM to an address on a verified domain to send anywhere.
  const from =
    process.env.GIG_REQUEST_FROM || "Gig Requests <onboarding@resend.dev>";

  // Resend's REST API — no SDK needed.
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: data.email,
      subject: `Gig request: ${data.eventType || "Event"} — ${data.name}`,
      text,
    }),
  })
    .then(async (res) => {
      if (res.ok) return true;
      console.error("[gig-request] email failed", res.status, await res.text());
      return false;
    })
    .catch((err) => {
      console.error("[gig-request] email failed", err);
      return false;
    });
}

// Google Apps Script web app from scripts/gig-sheet.gs.
function logToSheet(data: GigRequest): Promise<boolean> | null {
  const url = process.env.GIG_SHEET_URL;
  if (!url) return null;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    // Apps Script answers 200 with an HTML page when the script throws,
    // so only trust the { ok: true } the script returns on success.
    .then(async (res) => {
      const body = await res.text();
      if (res.ok && body.includes('"ok":true')) return true;
      console.error("[gig-request] sheet failed", res.status, body.slice(0, 500));
      return false;
    })
    .catch((err) => {
      console.error("[gig-request] sheet failed", err);
      return false;
    });
}
