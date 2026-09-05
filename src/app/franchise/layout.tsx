import { Suspense, type ReactNode } from "react";
import { Navbar } from "@/src/components/public/navbar";
import { Footer } from "@/src/components/public/footer";
import { StructuredData } from "@/src/components/public/structured-data";
import { WebVitalsReporter } from "@/src/components/public/web-vitals-reporter";

export default function FranchiseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StructuredData />
      <WebVitalsReporter />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
