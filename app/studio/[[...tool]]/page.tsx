// Sanity Studio: the content editor for exec, at /studio.
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <p style={{ fontFamily: "system-ui, sans-serif", padding: 32 }}>
        Sanity isn&apos;t set up yet. Add NEXT_PUBLIC_SANITY_PROJECT_ID to .env.local
        (see the README) and restart the dev server.
      </p>
    );
  }
  return <NextStudio config={config} />;
}
