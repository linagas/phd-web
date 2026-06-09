import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "2xl": "1440px",
      },
      maxWidth: {
        "screen-2xl": "1440px",
      },
      fontFamily: {
        heading: ["var(--font-heading)", ...fontFamily.sans],
        body: ["var(--font-body)", ...fontFamily.sans],
      },
      colors: {
        black: {
          1: "#000000",
          2: "#223340",
        },
        blue: {
          1: "#0CAAFD",
          2: "#21323f",
          400: "#2589FE",
          500: "#223340",
          600: "#2F6FEB",
        },
        pink: {
          400: "#FF3365",
          500: "#e03d6b",
        },
        purple: {
          400: "#532DC4",
          12: "#542fc2",
        },
        phd: {
          dark: "#0B0F19",
          card: "#111827",
          cyan: "#38BDF8",
          pink: "#F43F5E",
          purple: "#818CF8",
        },
      },
      borderRadius: {
        xl: `calc(var(--radius) + 4px)`,
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
