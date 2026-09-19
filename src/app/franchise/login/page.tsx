import { LoginForm } from "@/src/components/portal/login-form";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const privateLoginMetadata = (corporate: boolean): Metadata => ({
  title: corporate ? "Corporate Login | Budda's Workspace" : "Operator Login | Budda's Operator Portal",
  description: corporate ? "Authorized sign-in for Budda's corporate operations." : "Authorized sign-in for Budda's franchise operators.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: null,
  twitter: null,
});

export const generateMetadata = async ({ searchParams }: { searchParams: Promise<{ access?: string | string[] }> }): Promise<Metadata> =>
  privateLoginMetadata((await searchParams).access === "corporate");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ access?: string | string[] }> }) {
  const corporate = (await searchParams).access === "corporate";
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
        <p className="operator-login-eyebrow">{corporate ? "Corporate Operations" : "Operator Workspace"}</p>
        <h1 className="operator-login-heading">{corporate ? "Sign In to Corporate Operations." : "Sign In to Your Store."}</h1>
        <p className="operator-login-subtext">{corporate ? "Receive, assign, process, and close authorized operator work." : "Access your restaurant supplies catalog, order history, and operations support."}</p>
      </section>
      <div className="mt-4 lg:mt-8">
        <LoginForm destination={corporate ? "/corporate" : "/portal"} />
      </div>
      <p className="mt-5 text-center text-sm leading-relaxed text-bds-cocoa/80">
        {corporate ? (
          <>Need store-level access? <Link href="/franchise/login" className="font-semibold text-bds-teal-dark underline underline-offset-4">Sign in to the Operator Workspace</Link>.</>
        ) : (
          <>Part of Budda&apos;s corporate team? <Link href="/franchise/login?access=corporate" className="font-semibold text-bds-teal-dark underline underline-offset-4">Sign in to Corporate Operations</Link>.</>
        )}
      </p>
    </main>
  );
}
