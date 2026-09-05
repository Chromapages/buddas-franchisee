import { LoginForm } from "@/src/components/portal/login-form";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Operator Login — Budda's Franchise Workspace",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-[480px] px-4 py-4 sm:px-6 sm:py-6 lg:py-12">
      <section className="mx-auto max-h-[140px] space-y-2 overflow-hidden text-center lg:max-h-none lg:space-y-4">
        <Link href="/franchise" className="inline-block">
          <Image
            src="/images/Logo.svg"
            alt="Budda's Franchising"
            width={240}
            height={48}
            className="mx-auto h-8 w-auto object-contain lg:h-12"
            priority
          />
        </Link>
        <p className="operator-login-eyebrow">Operator Workspace</p>
        <h1 className="operator-login-heading">Sign In to Your Store.</h1>
        <p className="operator-login-subtext">Access your restaurant supplies catalog, order history, and operations support.</p>
      </section>
      <div className="mt-4 lg:mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
