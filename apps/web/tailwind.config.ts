import type { Config } from "tailwindcss";

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
      }
    }
  },
  plugins: []
};

export default config;
