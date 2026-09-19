export const StructuredData = ({ organizationName = "Budda's Hawaiian Bakery & Grill", siteUrl = "https://buddasfranchise.com", email = "buddasbakery@gmail.com", phoneHref = "tel:+18017010617" }: { organizationName?: string; siteUrl?: string; email?: string; phoneHref?: string }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: organizationName,
        url: siteUrl,
        logo: `${siteUrl}/images/Logo.svg`,
        description:
          "Home of the Budda Roll. Budda's is a Hawaiian Bakery & Grill with public franchise opportunity information.",
        email,
        telephone: phoneHref.replace("tel:", ""),
        address: {
          "@type": "PostalAddress",
          addressLocality: "La'ie",
          addressRegion: "HI",
          postalCode: "96762",
          addressCountry: "US",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: organizationName,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
};
