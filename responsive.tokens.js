export const responsiveTokens = {
  breakpoints: {
    phone: "30rem",
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
    hero: "67.25rem",
    nav: "77.8125rem",
    xl: "80rem",
    // 64rem readable dossier column + 17rem rail + 2rem gutter + 4rem page gutters.
    dossierSpine: "87rem",
    heroWide: "90.5rem",
  },
  containers: {
    form: "40rem",
    reading: "48rem",
    detail: "64rem",
    narrow: "40rem",
    default: "75rem",
    wide: "90rem",
  },
  containerQueries: {
    candidateActions: "36.375rem",
    heroActions: "42.5rem",
    catalogTwo: "48rem",
    catalogThree: "64rem",
    portalSplit: "60rem",
  },
};

export const tailwindScreens = {
  phone: responsiveTokens.breakpoints.phone,
  sm: responsiveTokens.breakpoints.sm,
  md: responsiveTokens.breakpoints.md,
  lg: responsiveTokens.breakpoints.lg,
  hero: responsiveTokens.breakpoints.hero,
  nav: responsiveTokens.breakpoints.nav,
  xl: responsiveTokens.breakpoints.xl,
  "dossier-spine": responsiveTokens.breakpoints.dossierSpine,
  "hero-wide": responsiveTokens.breakpoints.heroWide,
};
