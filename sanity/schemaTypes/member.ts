import { defineField, defineType } from "sanity";
import { voiceParts } from "@/lib/types";

export const member = defineType({
  name: "member",
  title: "Member",
  type: "document",
  description: "Please get each person's OK on their bio and photo before publishing.",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Profile URL",
      description: "Their page lives at /members/<this>. Click Generate.",
      type: "slug",
      options: { source: "name" },
      validation: (r) =>
        r.required().custom((slug) =>
          // /members/exec is the exec board page.
          slug?.current === "exec" ? '"exec" is reserved, pick another' : true
        ),
    }),
    defineField({
      name: "status",
      description: "Switch to Alumni when they graduate, and clear their exec role.",
      type: "string",
      options: { list: [{ title: "Current", value: "current" }, { title: "Alumni", value: "alumni" }], layout: "radio", direction: "horizontal" },
      initialValue: "current",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "voicePart",
      title: "Voice part",
      type: "string",
      options: { list: [...voiceParts] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "classYear", title: "Class year", type: "number", validation: (r) => r.required().integer().min(1990).max(2100) }),
    defineField({
      name: "execRole",
      title: "Exec role",
      description: 'e.g. "President". Leave blank if not on exec.',
      type: "string",
      validation: (r) =>
        r
          .custom((role, { document }) =>
            role && document?.status === "alumni" ? "Alumni aren't shown on the exec board. Clear this?" : true
          )
          .warning(),
    }),
    defineField({ name: "major", type: "string" }),
    defineField({ name: "hometown", type: "string" }),
    defineField({ name: "photo", description: "Portrait orientation (4:5) looks best.", type: "image" }),
    defineField({ name: "bio", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({ name: "solos", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "funFact", title: "Fun fact", type: "text", rows: 2 }),
  ],
  orderings: [
    { title: "Name", name: "name", by: [{ field: "name", direction: "asc" }] },
    { title: "Class year, newest", name: "classYearDesc", by: [{ field: "classYear", direction: "desc" }] },
  ],
  preview: {
    select: { title: "name", voicePart: "voicePart", execRole: "execRole", classYear: "classYear", media: "photo" },
    prepare: ({ title, voicePart, execRole, classYear, media }) => ({
      title,
      subtitle: [execRole, voicePart, classYear && `’${String(classYear).slice(2)}`].filter(Boolean).join(" · "),
      media,
    }),
  },
});
