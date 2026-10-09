// Set these in .env.local and on Vercel; see README → "Editing content".
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-10-01";

// Without a project ID the site falls back to the starter data in content/.
export const isSanityConfigured = projectId !== "";
