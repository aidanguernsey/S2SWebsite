import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getSite } from "@/lib/content";
import { SiteChrome } from "@/components/SiteChrome";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: site.name, template: `%s · ${site.name}` },
    description: site.description,
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // Analytics lives here rather than the root layout so /studio visits aren't counted.
  return (
    <>
      <SiteChrome>{children}</SiteChrome>
      <Analytics />
    </>
  );
}
