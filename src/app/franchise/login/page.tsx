import { defaultPortalStorage } from "@/src/features/portal/storage-adapter.ts";
import { LoginForm } from "@/src/components/portal/login-form";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Operator Login — Budda's Franchise Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  const locations = await defaultPortalStorage.getLocations();

  return (
    <div className="py-16 sm:py-24 max-w-xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-4 mb-8">
        <Link href="/franchise" className="inline-block">
          <Image
            src="/images/Logo.svg"
            alt="Budda's Franchising"
            width={240}
            height={48}
            className="h-12 w-auto object-contain mx-auto"
            priority
          />
        </Link>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-clay block">
            Operator Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-brand-charcoal mt-1">
            Sign In to Your Store
          </h1>
          <p className="text-sm text-brand-charcoal/70 mt-1">
            Access your restaurant supplies catalog, order history, and operations support.
          </p>
        </div>
      </div>

      <LoginForm locations={locations} />
    </div>
  );
}
