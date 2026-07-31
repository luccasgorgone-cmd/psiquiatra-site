import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta base sofisticada (neutros quentes + tinta profunda)
        ivory: "#F7F5F1",
        sand: "#EFEBE4",
        stone: "#D9D3C9",
        ink: "#1A1A17",
        graphite: "#2C2C28",
        muted: "#6B6760",
        // Cor de acento controlada por variável CSS (editável no painel)
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          soft: "rgb(var(--brand-soft) / <alpha-value>)",
          deep: "rgb(var(--brand-deep) / <alpha-value>)",
        },
        // Acento quente (dourado/âmbar) — complementa a madeira/bege das fotos
        warm: {
          DEFAULT: "#A9814E",
          soft: "#CDA974",
          tint: "#F4ECDE",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      opacity: {
        4: "0.04",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 20px -8px rgba(26,26,23,0.12)",
        lift: "0 20px 60px -24px rgba(26,26,23,0.28)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
