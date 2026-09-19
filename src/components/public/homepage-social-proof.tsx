import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { HomepageSocialProofContent } from "@/src/features/cms/content";

const ExternalLink = ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => <Link href={href} target="_blank" rel="noreferrer" className={className}>{children}<span aria-hidden="true" className="ml-2">↗</span></Link>;

const ReviewStars = ({ rating }: { rating: number }) => <span aria-label={`${rating} out of 5 stars`} className="tracking-[0.16em] text-bds-gold">{"★".repeat(rating)}<span aria-hidden="true" className="text-bds-teal-dark/20">{"★".repeat(5 - rating)}</span></span>;

const experienceCardCopy = [
  { label: "Food", title: "The Roll that started everything." },
  { label: "Craft", title: "Fresh work, made visible." },
  { label: "Hospitality", title: "Care behind the counter." },
] as const;

const officialSocialProfiles = [
  { label: "Instagram", href: "https://www.instagram.com/buddashawaiian/", icon: "https://cdn.simpleicons.org/instagram/1C5F56" },
  { label: "TikTok", href: "https://www.tiktok.com/@buddas_bakery", icon: "https://cdn.simpleicons.org/tiktok/1C5F56" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/buddas-hawaiian-bakery-grill", icon: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/linkedin.svg" },
] as const;

const DesktopExperience = ({ content }: { content: HomepageSocialProofContent }) => (
  <section aria-labelledby="homepage-social-proof-title" className="homepage-experience-desktop hidden bg-bds-cream lg:block">
    <div className="content-wide homepage-experience-shell">
      <header className="homepage-experience-header">
        <div>
          <p>{content.eyebrow}</p>
          <h2 id="homepage-social-proof-title">{content.title}</h2>
        </div>
        <p>{content.description}</p>
      </header>

      <div className="homepage-experience-gallery">
        {content.instagramPosts.slice(0, 3).map((post, index) => {
          const copy = experienceCardCopy[index] ?? experienceCardCopy[2];
          return (
            <Link
              key={`${post.postUrl}-${post.image.src}`}
              href={post.postUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${copy.title} Visit Budda's Hawaiian Bakery & Grill`}
              className={`homepage-experience-card ${index === 0 ? "homepage-experience-card-featured" : ""}`}
            >
              <Image src={post.image.src} alt={post.image.alt} fill loading="lazy" sizes={index === 0 ? "47vw" : "23vw"} className="object-cover" />
              <span className="homepage-experience-card-shade" aria-hidden="true" />
              <span className="homepage-experience-card-copy">
                <span>{copy.label}</span>
                <strong>{copy.title}</strong>
              </span>
              <span className="homepage-experience-card-action" aria-hidden="true"><ArrowRight /></span>
            </Link>
          );
        })}
      </div>

      <aside className="homepage-experience-cta" aria-label="Visit Budda's Hawaiian Bakery & Grill">
        <div>
          <h3>Experience Budda&apos;s for yourself.</h3>
          <p>Explore menus, locations, and current updates.</p>
        </div>
        <ExternalLink href="https://buddasbakerygrill.com">Visit the restaurant site</ExternalLink>
        <nav className="homepage-experience-socials" aria-label="Follow Budda's on social media">
          {officialSocialProfiles.map((profile) => <Link key={profile.href} href={profile.href} target="_blank" rel="noreferrer" aria-label={`Follow Budda's on ${profile.label}`}>
            <img src={profile.icon} alt="" aria-hidden="true" referrerPolicy="no-referrer" />
          </Link>)}
        </nav>
      </aside>
    </div>
  </section>
);

const MobileExperience = ({ content }: { content: HomepageSocialProofContent }) => (
  <section aria-labelledby="homepage-social-proof-mobile-title" className="bg-bds-cream py-12 sm:py-16 lg:hidden">
    <div className="content-wide">
      <header className="grid gap-5 border-b border-bds-teal-dark/15 pb-8">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-bds-teal-dark">{content.eyebrow}</p>
          <h2 id="homepage-social-proof-mobile-title" className="homepage-section-heading mt-3 max-w-[18ch] text-bds-teal-dark">{content.title}</h2>
        </div>
        <p className="homepage-section-description max-w-[48ch] text-bds-cocoa">{content.description}</p>
      </header>

      <div className="mt-8">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-bds-teal-dark">{content.source === "cms" ? "From Instagram" : content.galleryLabel}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
          {content.instagramPosts.slice(0, 3).map((post, index) => <ExternalLink key={`${post.postUrl}-${post.image.src}`} href={post.postUrl} className={`group relative block overflow-hidden rounded-xl bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-4 focus-visible:ring-offset-bds-cream ${index === 1 ? "mt-5" : ""}`}>
            <Image src={post.image.src} alt={post.image.alt} width={640} height={640} sizes="31vw" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" />
            <span className="sr-only">{content.source === "cms" ? "View Instagram post" : "Visit Budda's Hawaiian Bakery & Grill"}</span>
          </ExternalLink>)}
        </div>
      </div>

      {content.googleReviews.length && content.googleReviewsUrl ? <aside className="mt-8 rounded-2xl border border-bds-teal-dark/15 bg-white p-6 sm:p-8" aria-labelledby="homepage-google-reviews-mobile-title">
        <div className="flex items-center justify-between gap-4">
          <p id="homepage-google-reviews-mobile-title" className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-bds-teal-dark">Google reviews</p>
          <ExternalLink href={content.googleReviewsUrl} className="touch-target-inline inline-flex min-h-11 items-center font-heading text-sm font-semibold text-bds-teal-dark underline underline-offset-4 hover:text-bds-teal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2">Read all</ExternalLink>
        </div>
        <div className="mt-6 space-y-6">
          {content.googleReviews.slice(0, 2).map((review) => <blockquote key={`${review.reviewerName}-${review.review}`} className="border-l-2 border-bds-gold pl-4">
            <ReviewStars rating={review.rating} />
            <p className="mt-2 font-body text-base leading-7 text-bds-cocoa">“{review.review}”</p>
            <footer className="mt-3 font-heading text-sm font-semibold text-bds-teal-dark">{review.reviewerName}</footer>
          </blockquote>)}
        </div>
      </aside> : null}

      {content.socialLinks.length ? <nav aria-label="Budda's social channels" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-bds-teal-dark/15 pt-6">
        {content.socialLinks.map((link) => <ExternalLink key={link.href} href={link.href} className="touch-target-inline inline-flex min-h-11 items-center font-heading text-sm font-semibold text-bds-teal-dark underline underline-offset-4 hover:text-bds-teal focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-teal-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bds-cream">{link.label}</ExternalLink>)}
      </nav> : null}
    </div>
  </section>
);

export const HomepageSocialProof = ({ content }: { content: HomepageSocialProofContent }) => <>
  <DesktopExperience content={content} />
  <MobileExperience content={content} />
</>;
