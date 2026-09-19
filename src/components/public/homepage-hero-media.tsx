import Image from "next/image";
import { FRANCHISE_HOME_HERO_CONTENT } from "@/src/features/franchise/home-hero-content";

/** One responsive hero image prevents hidden breakpoint variants from competing. */
export const HomepageHeroMedia = ({ content = FRANCHISE_HOME_HERO_CONTENT }: { content?: typeof FRANCHISE_HOME_HERO_CONTENT }) => {
  const media = content.media;

  return (
    <figure
      className="homepage-hero-shared-media"
      style={{ aspectRatio: "3 / 2", margin: 0, overflow: "hidden" }}
    >
      <picture>
        <source media="(min-width: 67.25rem)" srcSet={media.desktopImage} />
        <Image
          src={media.mobileImage}
          alt={media.imageAlt}
          width={1672}
          height={941}
          loading="eager"
          fetchPriority="high"
          className="homepage-hero-shared-media-image h-full w-full object-cover"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          sizes="(max-width: 67.1875rem) 100vw, 58.333vw"
        />
      </picture>
    </figure>
  );
};
