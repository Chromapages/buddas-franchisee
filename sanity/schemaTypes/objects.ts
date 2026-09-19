import { defineArrayMember, defineField, defineType } from "sanity";

const urlRule = (rule: any) =>
  rule.required().custom((value) => !value || value.startsWith("/") || /^(https:|mailto:|tel:)/.test(value) || "Use an internal path, HTTPS URL, mailto:, or tel: link.");

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required().max(80) }),
    defineField({ name: "href", title: "Destination", type: "string", validation: urlRule }),
    defineField({ name: "external", title: "Open externally", type: "boolean", initialValue: false }),
  ],
});

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Alternative text", type: "string", validation: (rule) => rule.required().max(160) }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required().max(70) }),
    defineField({ name: "description", type: "text", rows: 3, validation: (rule) => rule.required().min(50).max(160) }),
    defineField({ name: "ogImage", title: "Social image", type: "imageWithAlt" }),
  ],
});

export const stringList = defineType({
  name: "stringList",
  title: "Text list",
  type: "array",
  of: [defineArrayMember({ type: "string", validation: (rule) => rule.required().max(140) })],
});
