import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201a",
        leaf: "#2f6f4e",
        mint: "#dff4e8",
        skywash: "#e8f3ff",
        coral: "#f47b64",
        gold: "#f5c15b"
      },
      boxShadow: {
        soft: "0 20px 45px rgba(23, 32, 26, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
