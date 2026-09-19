import type { SchemaTypeDefinition } from "sanity";
import { homepage } from "./homepage";
import { homepageSocialProof } from "./homepageSocialProof";
import { homepageTestimonial } from "./homepageTestimonial";
import { imageWithAlt, link, seo, stringList } from "./objects";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  link,
  imageWithAlt,
  seo,
  stringList,
  homepage,
  homepageSocialProof,
  homepageTestimonial,
  siteSettings,
];
