import { defineArrayMember, defineField, defineType } from "sanity";

const externalUrl = (rule: any) => rule.required().uri({ scheme: ["https"] });

export const homepageSocialProof = defineType({
  name: "homepageSocialProof",
  title: "Homepage Social Proof",
  type: "document",
  fields: [
    defineField({ name: "internalTitle", title: "Internal title", type: "string", validation: (rule) => rule.required().max(80) }),
    defineField({ name: "enabled", title: "Show on homepage", type: "boolean", initialValue: false, validation: (rule) => rule.required() }),
    defineField({ name: "eyebrow", type: "string", initialValue: "Loved locally", validation: (rule) => rule.required().max(60) }),
    defineField({ name: "title", title: "Section title", type: "string", initialValue: "See what guests are sharing.", validation: (rule) => rule.required().max(100) }),
    defineField({ name: "description", type: "text", rows: 3, validation: (rule) => rule.required().min(30).max(280) }),
    defineField({
      name: "instagramPosts",
      title: "Instagram posts",
      type: "array",
      of: [defineArrayMember({ type: "object", fields: [
        defineField({ name: "image", title: "Post image", type: "imageWithAlt", validation: (rule) => rule.required() }),
        defineField({ name: "postUrl", title: "Instagram post URL", type: "url", validation: externalUrl }),
      ], preview: { select: { title: "image.alt", media: "image" } } })],
      validation: (rule) => rule.required().min(3).max(6),
    }),
    defineField({
      name: "googleReviews",
      title: "Google reviews",
      type: "array",
      of: [defineArrayMember({ type: "object", fields: [
        defineField({ name: "reviewerName", title: "Reviewer name", type: "string", validation: (rule) => rule.required().max(80) }),
        defineField({ name: "review", title: "Review", type: "text", rows: 4, validation: (rule) => rule.required().min(20).max(500) }),
        defineField({ name: "rating", title: "Rating", type: "number", validation: (rule) => rule.required().integer().min(1).max(5) }),
      ], preview: { select: { title: "reviewerName", subtitle: "review" } } })],
      validation: (rule) => rule.required().min(1).max(3),
    }),
    defineField({ name: "googleReviewsUrl", title: "Google reviews URL", type: "url", validation: externalUrl }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
  preview: { select: { title: "internalTitle", subtitle: "title", media: "instagramPosts.0.image" } },
});
