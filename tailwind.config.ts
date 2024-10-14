import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
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
          2: "21323f",
          400: "#2589FE",
          500: "#223340",
          600: "#2F6FEB",
        },
        pink: {
          400: "#FF3365",
        },
        purple: {
          400: "#532DC4",
          12: "#542fc2",
        },
      },
      borderRadius: {
        xl: `calc(var(--radius) + 4px)`,
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
