// Concert times are shown in the school's time zone, no matter where the
// server runs (Vercel renders in UTC).
export const TIME_ZONE = "America/New_York";

// Reads a time with no offset, like "2026-12-05T19:30:00", as local time at
// school and returns it as UTC ISO. Times that already have an offset pass through.
export function schoolTimeToIso(time: string) {
  if (/(Z|[+-]\d\d:\d\d)$/i.test(time)) return new Date(time).toISOString();
  const offset = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(time + "Z"))
    .find((p) => p.type === "timeZoneName")!
    .value.replace("GMT", "");
  return new Date(time + (offset || "Z")).toISOString();
}
