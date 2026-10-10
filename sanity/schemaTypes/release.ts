import { defineArrayMember, defineField, defineType } from "sanity";
import { releaseKinds } from "@/lib/types";

export const release = defineType({
  name: "release",
  title: "Release",
  type: "document",
  description:
    "An album, EP, or single. Each track with a YouTube link shows the video; otherwise a Spotify player.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: { list: [...releaseKinds], layout: "radio", direction: "horizontal" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "releaseDate", title: "Release date", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "spotifyUrl",
      title: "Spotify link",
      description: "Share link to the whole album, EP, or single.",
      type: "url",
    }),
    defineField({
      name: "tracks",
      description: "In track-list order. Drag to reorder.",
      type: "array",
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          name: "track",
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "youtube",
              title: "YouTube link",
              description: "Paste the video's link (or just its ID).",
              type: "string",
            }),
            defineField({
              name: "spotifyUrl",
              title: "Spotify link",
              description: "Share link to this track. Shown as a player when there's no YouTube link.",
              type: "url",
            }),
            defineField({ name: "arranger", type: "string" }),
            defineField({ name: "soloists", type: "array", of: [{ type: "string" }] }),
          ],
          preview: {
            select: { title: "title", youtube: "youtube", soloists: "soloists" },
            prepare: ({ title, youtube, soloists }) => ({
              title,
              subtitle: [youtube && "Video", soloists?.filter(Boolean).join(", ")].filter(Boolean).join(" · "),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Pin to homepage",
      description: "Show this release's tracks ahead of newer ones on the homepage.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [{ title: "Release date, newest", name: "releaseDateDesc", by: [{ field: "releaseDate", direction: "desc" }] }],
  preview: {
    select: { title: "title", kind: "kind", releaseDate: "releaseDate", featured: "featured", tracks: "tracks" },
    prepare: ({ title, kind, releaseDate, featured, tracks }) => ({
      title: featured ? `📌 ${title}` : title,
      subtitle: [kind, releaseDate, tracks?.length && `${tracks.length} track${tracks.length === 1 ? "" : "s"}`]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
