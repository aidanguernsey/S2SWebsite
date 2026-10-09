import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  description: "Events move to “Past shows” automatically once their date passes.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "ID", description: "Click Generate.", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "date", title: "Date & time", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "venue", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "ticketUrl", title: "Ticket link", type: "url", validation: (r) => r.uri({ allowRelative: true }) }),
    defineField({ name: "price", description: 'e.g. "$5 students, $10 general" or "Free".', type: "string" }),
  ],
  orderings: [{ title: "Date, newest", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "date", venue: "venue" },
    prepare: ({ title, date, venue }) => ({
      title,
      subtitle: [date && new Date(date).toLocaleDateString("en-US", { dateStyle: "medium" }), venue].filter(Boolean).join(" · "),
    }),
  },
});
