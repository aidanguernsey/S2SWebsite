"use client";

// Sanity Studio, served by this app at /studio.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

// Site settings is a single document with a fixed ID, so it can't be
// created twice or deleted.
const SINGLETON = "siteSettings";

export default defineConfig({
  basePath: "/studio",
  title: "Soul2Soul website",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((t) => t.schemaType !== SINGLETON),
  },
  document: {
    actions: (actions, { schemaType }) =>
      schemaType === SINGLETON
        ? actions.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action))
        : actions,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Website")
          .items([
            S.listItem()
              .title("Site settings")
              .id(SINGLETON)
              .child(S.document().schemaType(SINGLETON).documentId(SINGLETON)),
            S.divider(),
            S.listItem()
              .title("Current members")
              .schemaType("member")
              .child(
                S.documentTypeList("member")
                  .title("Current members")
                  .filter('_type == "member" && status == "current"')
              ),
            S.listItem()
              .title("Alumni")
              .schemaType("member")
              .child(
                S.documentTypeList("member")
                  .title("Alumni")
                  .filter('_type == "member" && status == "alumni"')
                  .defaultOrdering([{ field: "classYear", direction: "desc" }])
              ),
            S.documentTypeListItem("event").title("Events"),
            S.documentTypeListItem("release").title("Music & videos"),
            S.documentTypeListItem("merchItem").title("Merch"),
          ]),
    }),
  ],
});
