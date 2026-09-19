import { defineField, defineType } from "sanity";

export const homepageTestimonial = defineType({
  name: "homepageTestimonial",
  title: "Homepage Testimonial",
  type: "document",
  fields: [
    defineField({ name: "internalTitle", title: "Internal title", type: "string", validation: (rule) => rule.required().max(80) }),
    defineField({ name: "enabled", title: "Show on homepage", type: "boolean", initialValue: false, validation: (rule) => rule.required() }),
    defineField({ name: "eyebrow", type: "string", initialValue: "From our leadership", validation: (rule) => rule.required().max(60) }),
    defineField({ name: "quote", type: "text", rows: 6, validation: (rule) => rule.required().min(40).max(600) }),
    defineField({ name: "personName", title: "CEO name", type: "string", validation: (rule) => rule.required().max(80) }),
    defineField({ name: "personTitle", title: "CEO title", type: "string", initialValue: "Chief Executive Officer", validation: (rule) => rule.required().max(100) }),
    defineField({ name: "image", title: "CEO portrait", type: "imageWithAlt", validation: (rule) => rule.required() }),
    defineField({ name: "ctaLabel", title: "Contact CTA label", type: "string", initialValue: "Start a conversation", validation: (rule) => rule.required().max(50) }),
  ],
  preview: { select: { title: "internalTitle", subtitle: "personName", media: "image" } },
});
