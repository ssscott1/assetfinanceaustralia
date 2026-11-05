import type { Config } from "tailwindcss";

/**
 * PLACEHOLDER brand palette.
 *
 * The build spec asks for colours, fonts, logo and button style to be taken
 * directly from the live assetfinanceaustralia.com.au site. That site could
 * not be inspected from this environment (network policy blocks the
 * domain), so this is a clean placeholder in the same spirit as the other
 * Velocity Works ventures. Swap the hex values below for the real brand
 * tokens — everything in the app reads colour through these Tailwind names,
 * so this is the only file that needs to change.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        brand: "#1D4ED8",
        "brand-dark": "#1E3A8A",
        paper: "#F8FAFC",
        slate: "#64748B",
        success: "#16A34A",
        warning: "#B45309",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      minHeight: {
        tap: "56px",
      },
    },
  },
  plugins: [],
};

export default config;
