import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: "#8EE6C1",
        orange: "#FF7231",
        cloud: "#F0EEE9",
        charcoal: "#1A2421",
        paper: "#FBFAF7"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(26, 36, 33, 0.08)"
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#1A2421",
            "--tw-prose-headings": "#1A2421",
            "--tw-prose-links": "#FF7231",
            "--tw-prose-bold": "#1A2421",
            "--tw-prose-bullets": "#8EE6C1",
            a: { textDecoration: "underline", fontWeight: "600" }
          }
        }
      }
    }
  },
  plugins: [typography]
};

export default config;
