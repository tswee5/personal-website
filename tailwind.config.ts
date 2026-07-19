import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      colors: {
        paper: "#fbfaf7",
        ink: "#171717",
        muted: "#6d6a63",
        rule: "#d8d3ca",
        wash: "#f1eee8",
        moss: "#5f6d52",
        rust: "#8a4d32"
      }
    }
  },
  plugins: [typography]
};

export default config;
