import { defineField, defineType } from "sanity";

export const merchItem = defineType({
  name: "merchItem",
  title: "Merch item",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "price", description: 'e.g. "$25".', type: "string", validation: (r) => r.required() }),
    defineField({ name: "image", type: "image" }),
    defineField({
      name: "buyUrl",
      title: "Buy link",
      description: "A Stripe Payment Link or Printful/Shopify product URL. Leave blank to show “Coming soon”.",
      type: "url",
    }),
    defineField({ name: "sizes", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
  ],
  preview: { select: { title: "name", subtitle: "price", media: "image" } },
});
