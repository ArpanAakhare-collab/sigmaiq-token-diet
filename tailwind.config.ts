import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090a0f",
        foreground: "#f3f4f6",
        card: "rgba(18, 20, 29, 0.7)",
        "card-hover": "rgba(28, 32, 46, 0.8)",
        border: "rgba(255, 255, 255, 0.1)",
        accent: {
          DEFAULT: "#f59e0b", // Warm amber/orange
          hover: "#d97706",
          glow: "rgba(245, 158, 11, 0.2)",
        },
        muted: {
          DEFAULT: "#1f2937",
          foreground: "#9ca3af",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 25px -5px rgba(245, 158, 11, 0.3)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
