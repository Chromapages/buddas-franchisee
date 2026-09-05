import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isNonPublicEnvironment =
    process.env.NODE_ENV !== "production" ||
    process.env.DEPLOYMENT_ENV === "staging" ||
    process.env.DEPLOYMENT_ENV === "demo";

  return {
    rules: {
      userAgent: "*",
      disallow: isNonPublicEnvironment
        ? "/"
        : [
            "/franchise/login",
            "/franchise/login/reset",
            "/franchise/fdd",
            "/portal",
            "/portal/*",
            "/api/portal",
            "/api/portal/*",
          ],
    },
    sitemap: "https://buddasfranchise.com/sitemap.xml",
  };
}
