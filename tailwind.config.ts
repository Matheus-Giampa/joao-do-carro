import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        // Identidade João do Carro (a partir da logo): preto grafite + branco + vermelho esportivo
        ink: {
          50: "#f6f6f7",
          100: "#ececee",
          200: "#d6d7db",
          300: "#b1b3ba",
          400: "#85888f",
          500: "#64676f",
          600: "#4d5057",
          700: "#3a3c42",
          800: "#232428",
          900: "#141518",
          950: "#0a0a0c",
        },
        brand: {
          50: "#fff1f1",
          100: "#ffdfe0",
          200: "#ffc5c7",
          300: "#ff9ca0",
          400: "#ff5f67",
          500: "#f52a35",
          600: "#e1101d",
          700: "#bd0a16",
          800: "#9c0d17",
          900: "#82111a",
        },
        whatsapp: {
          DEFAULT: "#1fa855",
          dark: "#178a45",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,12,.06), 0 4px 16px rgba(10,10,12,.06)",
        "card-hover": "0 2px 4px rgba(10,10,12,.08), 0 16px 40px rgba(10,10,12,.16)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "fade-up": "fade-up .4s ease-out both",
        "slide-in": "slide-in .25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
