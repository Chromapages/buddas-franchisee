import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  turbopack: {},
  async redirects() {
    return [
      {
        source: "/franchisee-login",
        destination: "/franchise/login",
        permanent: true,
      },
      {
        source: "/portal/store",
        destination: "/portal/supplies",
        permanent: true,
      },
      {
        source: "/portal/store/:slug",
        destination: "/portal/supplies/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
