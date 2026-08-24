import type { ReactNode } from "react";
import { Navbar } from "@/src/components/public/navbar";
import { Footer } from "@/src/components/public/footer";
import { StructuredData } from "@/src/components/public/structured-data";

export default function FranchiseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StructuredData />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
