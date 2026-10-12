import type { Member } from "@/lib/types";
import data from "./members.json" with { type: "json" };

// Starter data and backup. The live site reads from Sanity (edit at /studio); this
// file is only copied in by `npm run seed` and shown when Sanity isn't configured.
// The entries live in members.json so scripts/member-sync.gs can add form
// submissions to it. Photos are paths under /public; `npm run seed` uploads them.
export const members = data as Member[];
