import Image from "next/image";
import Link from "next/link";
import type { HomepageTestimonialContent } from "@/src/features/cms/content";

export const HomepageTestimonial = ({ content }: { content: HomepageTestimonialContent }) => <section aria-labelledby="homepage-testimonial-title" className="w-full bg-bds-teal-dark">
    <div className="grid w-full overflow-hidden lg:grid-cols-2">
      <figure className="relative min-h-[320px] bg-bds-cream sm:min-h-[420px] lg:min-h-[560px]">
        <Image src={content.image.src} alt={content.image.alt} fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
      </figure>
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-bds-cream/80">{content.eyebrow}</p>
        <blockquote className="mt-5">
          <p id="homepage-testimonial-title" className="break-words font-heading text-2xl font-semibold leading-[1.35] tracking-[-0.025em] text-bds-cream sm:text-3xl lg:text-4xl">“{content.quote}”</p>
          <footer className="mt-7 border-l-2 border-bds-gold pl-4 text-bds-cream">
            <cite className="not-italic"><strong className="block font-heading text-base">{content.personName}</strong><span className="mt-1 block text-sm text-bds-cream/80">{content.personTitle}</span></cite>
          </footer>
        </blockquote>
        <Link href="/franchise/contact" className="touch-target mt-9 inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-bds-cream px-6 py-3 font-heading text-sm font-semibold text-bds-teal-dark transition-colors hover:bg-bds-gold-light focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bds-cream focus-visible:ring-offset-2 focus-visible:ring-offset-bds-teal-dark motion-reduce:transition-none">{content.ctaLabel}</Link>
      </div>
    </div>
</section>;
