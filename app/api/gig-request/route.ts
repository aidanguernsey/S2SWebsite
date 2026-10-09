import { NextResponse } from "next/server";

type GigRequest = {
  name: string;
  email: string;
  eventType?: string;
  date?: string;
  location?: string;
  details?: string;
  website?: string; // honeypot
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

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
    `Location: ${data.location || "—"}`,
    "",
    data.details || "(no details)",
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.GIG_REQUEST_TO;
  // onboarding@resend.dev only delivers to your own Resend account email;
  // set GIG_REQUEST_FROM to an address on a verified domain to send anywhere.
  const from =
    process.env.GIG_REQUEST_FROM || "Gig Requests <onboarding@resend.dev>";

  if (!apiKey || !to) {
    // Development fallback: no email configured yet.
    console.log("[gig-request]\n" + text);
    return NextResponse.json({ ok: true });
  }

  // Resend's REST API — no SDK needed.
  const res = await fetch("https://api.resend.com/emails", {
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
  });

  if (!res.ok) {
    console.error("[gig-request] email failed", res.status, await res.text());
    return NextResponse.json(
      { error: "We couldn't send your request. Please email us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
