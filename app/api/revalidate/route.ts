// Called by a Sanity webhook on every publish, so edits show up right away
// instead of within a minute. Setup: README → "Editing content".
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CACHE_TAG } from "@/lib/content";

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  }

  const { isValidSignature } = await parseBody(req, secret, true);
  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Every query shares one tag; the site is small enough to refresh it all.
  revalidateTag(CACHE_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
