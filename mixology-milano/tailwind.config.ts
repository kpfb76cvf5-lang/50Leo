import type { Config } from "tailwindcss";

// ============================================================================
// DESIGN SYSTEM — Mixology Week Milano
// Ispirazione: Apple (precisione), Airbnb (calore/card), Uber (funzionalità),
// Google Maps (chiarezza cartografica), Notion (tipografia editoriale)
// ============================================================================

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base neutra
        ink: {
          DEFAULT: "#0A0A0B", // nero quasi puro, non #000 piatto
          soft: "#141416",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#151517",     // grigio scuro superficie (dark mode cards)
          muted: "#F5F4F1",    // off-white caldo per light mode
          mutedDark: "#1D1D20",
        },
        gold: {
          DEFAULT: "#C9A227",  // oro principale — accento, non dominante
          soft: "#E4C767",
          dim: "#8A6E1D",
        },
        line: {
          DEFAULT: "#E7E5E0",  // bordi light mode
          dark: "#2A2A2E",     // bordi dark mode
        },
        text: {
          primary: "#0A0A0B",
          secondary: "#5B5A57",
          onDark: "#F5F4F1",
          onDarkSecondary: "#9A9A9E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-md": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-sm": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      borderRadius: {
        xl2: "1.25rem",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,11,0.04), 0 8px 24px rgba(10,10,11,0.06)",
        cardHover: "0 4px 12px rgba(10,10,11,0.08), 0 16px 40px rgba(10,10,11,0.10)",
        sheet: "0 -4px 24px rgba(10,10,11,0.12)",
        gold: "0 0 0 1px rgba(201,162,39,0.35)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)",
        "slide-up": "slideUp 0.35s cubic-bezier(0.22,1,0.36,1)",
        "pulse-marker": "pulseMarker 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseMarker: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,162,39,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(201,162,39,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
