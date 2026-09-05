import { Footer } from "@/src/components/public/footer";
import { Navbar } from "@/src/components/public/navbar";
import { StructuredData } from "@/src/components/public/structured-data";
import { Suspense } from "react";
import FranchiseHomePage from "./franchise/page";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <StructuredData />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={null}>
          <FranchiseHomePage />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
