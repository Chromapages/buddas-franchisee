import type { MetadataRoute } from "next";
import { getPortalRuntimeEnvironment } from "../features/portal/environment.ts";

export default function robots(): MetadataRoute.Robots {
  const isNonPublicEnvironment = getPortalRuntimeEnvironment() !== "production";

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
            "/corporate",
            "/corporate/*",
            "/api/corporate",
            "/api/corporate/*",
          ],
    },
    sitemap: "https://buddasfranchise.com/sitemap.xml",
  };
}
