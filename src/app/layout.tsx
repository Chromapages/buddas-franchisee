import type { Metadata, Viewport } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { getSiteSettings } from "@/src/features/cms/content";
import "./globals.css";

const displayFont = Poppins({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const bodyFont = DM_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-body",
});

const fallbackMetadata: Metadata = {
  title: "Budda's Hawaiian Bakery & Grill — Franchise Opportunity",
  description:
    "Explore Budda's Hawaiian Bakery & Grill franchise information, including the Budda Roll, operator qualifications, and mutual evaluation process.",
  metadataBase: new URL("https://buddasfranchise.com"),
  icons: {
    icon: "/images/favicon.svg",
  },
  openGraph: {
    title: "Budda's Hawaiian Bakery & Grill Franchise Opportunity",
    description:
      "Explore Budda's Hawaiian Bakery & Grill franchise information, including the Budda Roll, operator qualifications, and mutual evaluation process.",
    url: "https://buddasfranchise.com/franchise",
    siteName: "Budda's Franchising",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Budda's Hawaiian Bakery & Grill",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    ...fallbackMetadata,
    title: settings.defaultSeo.title,
    description: settings.defaultSeo.description,
    metadataBase: new URL(settings.siteUrl),
    openGraph: { ...fallbackMetadata.openGraph, title: settings.defaultSeo.title, description: settings.defaultSeo.description, siteName: settings.organizationName },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} bg-brand-cream text-brand-charcoal min-h-screen flex flex-col font-body`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
