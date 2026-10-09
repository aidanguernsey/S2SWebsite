import { defineField, defineType } from "sanity";

export const release = defineType({
  name: "release",
  title: "Release",
  type: "document",
  description: "Shown newest first. A release with a YouTube link shows the video; otherwise a Spotify player.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "kind",
      type: "string",
      options: { list: ["Music video", "Single", "Album", "Live"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "releaseDate", title: "Release date", type: "date", validation: (r) => r.required() }),
    defineField({ name: "youtube", title: "YouTube link", description: "Paste the video's link (or just its ID).", type: "string" }),
    defineField({ name: "spotifyUrl", title: "Spotify link", description: "Share link to the track, album, or playlist.", type: "url" }),
    defineField({ name: "arranger", type: "string" }),
    defineField({ name: "soloists", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "featured",
      title: "Pin to homepage",
      description: "Show ahead of newer releases on the homepage.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [{ title: "Release date, newest", name: "releaseDateDesc", by: [{ field: "releaseDate", direction: "desc" }] }],
  preview: {
    select: { title: "title", kind: "kind", releaseDate: "releaseDate", featured: "featured" },
    prepare: ({ title, kind, releaseDate, featured }) => ({
      title: featured ? `📌 ${title}` : title,
      subtitle: [kind, releaseDate].filter(Boolean).join(" · "),
    }),
  },
});
