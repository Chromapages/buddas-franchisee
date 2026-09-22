import { LoginForm } from "@/src/components/portal/login-form";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenText, ClipboardList, ExternalLink, Headphones, Package, Users } from "lucide-react";
import "./login-page.css";

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
  const features = [
    { icon: ClipboardList, title: "Orders" },
    { icon: Package, title: "Supplies" },
    { icon: BookOpenText, title: "Resources" },
    { icon: Headphones, title: "Support" },
    { icon: BarChart3, title: "Growth" },
  ] as const;

  return (
    <div className="operator-login-page">
      <section className="operator-login-story" aria-label="Budda's operator workspace benefits">
        <Image className="operator-login-story-photo" src="/images/food-experience-editorial.png" alt="Fresh Budda Rolls beside a grilled Hawaiian-style plate" fill sizes="53vw" priority />
        <div className="operator-login-story-shade" aria-hidden="true" />
        <div className="operator-login-story-content">
          <Link href="/franchise" className="operator-login-logo-link" aria-label="Budda's public site">
            <Image src="/images/Logo.svg" alt="Budda's Franchising" width={236} height={43} priority />
          </Link>
          <div className="operator-login-story-copy">
            <p className="operator-login-story-eyebrow">{corporate ? "Corporate Operations" : "Operator Workspace"}</p>
            <h2>{corporate ? <>One Brand.<br />One Operations Team.</> : <>Same Standards.<br />Stronger Restaurants.</>}</h2>
            <p>{corporate ? "The tools behind every Budda’s operator." : "The tools behind every Budda’s."}</p>
          </div>
          <ul className="operator-login-benefits">
            {features.map(({ icon: Icon, title }) => (
              <li key={title}>
                <span><Icon aria-hidden="true" /></span>
                <strong>{title}</strong>
              </li>
            ))}
          </ul>
          <p className="operator-login-tagline">A stronger<br />tomorrow,<br />together.</p>
        </div>
      </section>

      <section className="operator-login-panel" aria-labelledby="operator-login-title">
        <Link href="/franchise" className="operator-login-public-link">Visit Budda&apos;s Public Site <ExternalLink aria-hidden="true" /></Link>
        <div className="operator-login-panel-inner">
          <p className="operator-login-eyebrow">Welcome Back</p>
          <h1 id="operator-login-title" className="operator-login-heading">{corporate ? <>Sign in to Corporate<br />Operations.</> : <>Sign in to your<br />operator workspace.</>}</h1>
          <p className="operator-login-subtext">{corporate ? "Receive, assign, process, and close authorized operator work." : "Access orders, supplies, resources, support, and tools for your restaurant."}</p>
          <LoginForm destination={corporate ? "/corporate" : "/portal"} />
          <div className="operator-login-help-links">
            <div>
              <span><Headphones aria-hidden="true" /></span>
              <p>Need help accessing your account?<Link href="/franchise/contact">Contact Operations Support <ArrowRight aria-hidden="true" /></Link></p>
            </div>
            <div>
              <span><Users aria-hidden="true" /></span>
              {corporate ? (
                <p>Need store-level access?<Link href="/franchise/login">Sign in to the Operator Workspace <ArrowRight aria-hidden="true" /></Link></p>
              ) : (
                <p>Part of Budda&apos;s corporate team?<Link href="/franchise/login?access=corporate">Sign in to Corporate Operations <ArrowRight aria-hidden="true" /></Link></p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
