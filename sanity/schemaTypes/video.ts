import { defineField, defineType } from "sanity";

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  description:
    "A performance video of a song that isn't on an album, EP, or single. Listed under “Not Yet On Streaming” on the Music page. Once the song is released, add it to that release and delete it here.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "youtube",
      title: "YouTube link",
      description: "Paste the video's link (or just its ID).",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      description: "When the video was posted. Newest are listed first.",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({ name: "arranger", type: "string" }),
    defineField({ name: "soloists", type: "array", of: [{ type: "string" }] }),
  ],
  orderings: [{ title: "Newest", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "date", soloists: "soloists" },
    prepare: ({ title, date, soloists }) => ({
      title,
      subtitle: [date?.slice(0, 4), soloists?.filter(Boolean).join(", ")].filter(Boolean).join(" · "),
    }),
  },
});
