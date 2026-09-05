export const StructuredData = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://buddasfranchise.com/#organization",
        name: "Budda's Hawaiian Bakery & Grill",
        url: "https://buddasfranchise.com",
        logo: "https://buddasfranchise.com/images/Logo.svg",
        description:
          "Home of the iconic Budda Roll. Modern Hawaiian bakery and grill franchise opportunities.",
        email: "buddasbakery@gmail.com",
        telephone: "+1-801-701-0617",
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
        "@id": "https://buddasfranchise.com/#website",
        url: "https://buddasfranchise.com",
        name: "Budda's Franchise Opportunity",
        publisher: {
          "@id": "https://buddasfranchise.com/#organization",
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
