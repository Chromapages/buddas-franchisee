import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bds: {
          teal: {
            DEFAULT: "#54BFA5",
            dark: "#1C5F56",
          },
          cream: "#FFF8E8",
          gold: "#E9C559",
          orange: "#D36200",
          cocoa: "#5A3A1F",
          surface: {
            primary: "#FFF8E8",
            secondary: "#FFFFFF",
            inverse: "#1C5F56",
          },
          text: {
            heading: "#1C5F56",
            body: "#5A3A1F",
            inverse: "#FFF8E8",
          },
          action: {
            primary: "#1C5F56",
            "primary-text": "#FFF8E8",
            promo: "#D36200",
          },
        },
        brand: {
          mango: "#EFA43A",
          butter: "#F9DE9C",
          clay: "#C4522A",
          charcoal: "#1C1A17",
          sand: "#FAF6F0",
          cream: "#FFFDF9",
          forest: "#2D6A4F",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Poppins", "sans-serif"],
        display: ["var(--font-heading)", "Poppins", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "sans-serif"],
        sans: ["var(--font-body)", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
