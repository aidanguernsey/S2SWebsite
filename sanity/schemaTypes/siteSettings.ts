import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "links", title: "Contact & socials" },
    { name: "booking", title: "Booking" },
    { name: "history", title: "History" },
  ],
  fields: [
    defineField({ name: "name", title: "Group name", type: "string", group: "basics", validation: (r) => r.required() }),
    defineField({
      name: "shortName",
      title: "Short name",
      description: "Shown in the round logo badge, e.g. S2S.",
      type: "string",
      group: "basics",
      validation: (r) => r.required().max(4),
    }),
    defineField({ name: "school", type: "string", group: "basics", validation: (r) => r.required() }),
    defineField({ name: "founded", title: "Year founded", type: "string", group: "basics", validation: (r) => r.required() }),
    defineField({ name: "tagline", type: "string", group: "basics", validation: (r) => r.required() }),
    defineField({
      name: "description",
      description: "One sentence under the tagline on the homepage, also used by search engines.",
      type: "text",
      rows: 2,
      group: "basics",
      validation: (r) => r.required(),
    }),
    defineField({ name: "groupPhoto", title: "Group photo", description: "Homepage hero photo.", type: "image", group: "basics" }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string", group: "links", validation: (r) => r.required().email() }),
    defineField({
      name: "socials",
      type: "object",
      group: "links",
      fields: ["instagram", "youtube", "spotify", "tiktok"].map((name) =>
        defineField({ name, type: "url", description: name === "spotify" ? "Artist link. Also shown as a player on the Music page." : undefined })
      ),
    }),
    defineField({
      name: "booking",
      type: "object",
      group: "booking",
      description: "Bullet points next to the gig request form.",
      fields: [
        defineField({ name: "setLength", title: "Set length", type: "string" }),
        defineField({ name: "travelArea", title: "Travel area", type: "string" }),
        defineField({ name: "rates", type: "string" }),
      ],
    }),
    defineField({
      name: "history",
      title: "History timeline",
      description: "Shown on the About page, in this order. Drag to reorder.",
      type: "array",
      group: "history",
      of: [
        defineArrayMember({
          type: "object",
          name: "milestone",
          fields: [
            defineField({ name: "year", type: "string", validation: (r) => r.required() }),
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "text", type: "text", rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: "title", subtitle: "year" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
