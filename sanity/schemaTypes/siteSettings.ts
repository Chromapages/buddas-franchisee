import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [{ name: "identity", title: "Identity & SEO" }, { name: "navigation", title: "Navigation" }, { name: "footer", title: "Footer" }],
  fields: [
    defineField({ name: "organizationName", type: "string", group: "identity", validation: (rule) => rule.required() }),
    defineField({ name: "siteUrl", title: "Canonical site URL", type: "url", group: "identity", validation: (rule) => rule.required().uri({ scheme: ["https"] }) }),
    defineField({ name: "defaultSeo", type: "seo", group: "identity", validation: (rule) => rule.required() }),
    defineField({ name: "primaryNavigation", title: "Primary navigation", type: "array", group: "navigation", of: [defineArrayMember({ type: "link" })], validation: (rule) => rule.required().min(1).max(6) }),
    defineField({ name: "utilityNavigation", title: "Utility navigation", type: "array", group: "navigation", of: [defineArrayMember({ type: "link" })], validation: (rule) => rule.required().min(1).max(4) }),
    defineField({ name: "inquiryAction", title: "Inquiry action", type: "link", group: "navigation", validation: (rule) => rule.required() }),
    defineField({ name: "email", type: "string", group: "footer", validation: (rule) => rule.required().email() }),
    defineField({ name: "phone", type: "string", group: "footer", validation: (rule) => rule.required() }),
    defineField({ name: "phoneHref", type: "string", group: "footer", validation: (rule) => rule.required().regex(/^tel:/, { name: "telephone URL" }) }),
    defineField({ name: "copyright", type: "string", group: "footer", validation: (rule) => rule.required() }),
    defineField({ name: "legalDisclaimer", type: "text", rows: 4, group: "footer", validation: (rule) => rule.required() }),
    defineField({ name: "footerNavigation", title: "Footer navigation", type: "array", group: "footer", of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "id", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "link" })], validation: (rule) => rule.required().min(1) }),
    ] })], validation: (rule) => rule.required().min(1) }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
