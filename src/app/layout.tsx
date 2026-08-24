import type { Metadata } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const displayFont = Poppins({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const bodyFont = DM_Sans({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Budda's Hawaiian Bakery & Grill — Franchise Opportunity",
  description:
    "Home of the iconic Budda Roll. Discover scalable bakery and grill franchise opportunities blending warm island hospitality with high-yield all-day utility.",
  metadataBase: new URL("https://buddasfranchise.com"),
  icons: {
    icon: "/images/favicon.svg",
  },
  openGraph: {
    title: "Budda's Hawaiian Bakery & Grill Franchise Opportunity",
    description:
      "Home of the iconic Budda Roll. Learn about investment qualifications, operating models, and territory clearance.",
    url: "https://buddasfranchise.com/franchise",
    siteName: "Budda's Franchise Hub",
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

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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

