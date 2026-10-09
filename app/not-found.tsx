import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

// Renders outside app/(site)/layout.tsx, so it brings its own header and footer.
export default function NotFound() {
  return (
    <SiteChrome>
      <div className="container page-title" style={{ paddingBottom: 64 }}>
        <h1>Off key.</h1>
        <p className="lede">We couldn&apos;t find that page.</p>
        <div className="actions">
          <Link href="/" className="btn btn-dark">Back home</Link>
        </div>
      </div>
    </SiteChrome>
  );
}
