import type { MetadataRoute } from "next";

const siteUrl = "https://buddasfranchise.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/franchise",
    "/franchise/about",
    "/franchise/why-buddas",
    "/franchise/the-opportunity",
    "/franchise/process",
    "/franchise/faq",
    "/franchise/contact",
    "/privacy",
    "/terms",
    "/accessibility",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "/franchise/the-opportunity" ? 0.9 : 0.7,
  }));
}
