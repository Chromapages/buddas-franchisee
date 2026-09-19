"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Budda's Franchise",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fn7uc4b8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) => S.list().title("Content").items([
        S.listItem().title("Home Page").child(S.document().schemaType("homepage").documentId("homepage")),
        S.listItem().title("Homepage Social Proof").child(S.documentTypeList("homepageSocialProof").title("Homepage Social Proof")),
        S.listItem().title("Homepage Testimonials").child(S.documentTypeList("homepageTestimonial").title("Homepage Testimonials")),
        S.listItem().title("Site Settings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
