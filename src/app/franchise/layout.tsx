import type { ReactNode } from "react";
import { Navbar } from "@/src/components/public/navbar";
import { Footer } from "@/src/components/public/footer";
import { WebVitalsReporter } from "@/src/components/public/web-vitals-reporter";
import { getSiteSettings } from "@/src/features/cms/content";

export default async function FranchiseLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSiteSettings();
  return (
    <div className="flex flex-col min-h-screen">
      <WebVitalsReporter />
      <Navbar primaryItems={settings.primaryNavigation} utilityItems={settings.utilityNavigation} inquiryAction={settings.inquiryAction} />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer content={settings as never} />
    </div>
  );
}
