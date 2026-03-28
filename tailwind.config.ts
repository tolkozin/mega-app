import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
        heading: ["var(--font-commissioner)", "system-ui", "sans-serif"],
        lato: ["Lato", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* v2 design system */
        v2: {
          primary: "var(--v2-primary)",
          "primary-hover": "var(--v2-primary-hover)",
          "primary-active": "var(--v2-primary-active)",
          "primary-light": "var(--v2-primary-light)",
          dark: "var(--v2-text-dark)",
          "text-secondary": "var(--v2-text-secondary)",
          muted: "var(--v2-text-muted)",
          disabled: "var(--v2-text-disabled)",
          border: "var(--v2-border)",
          "border-hover": "var(--v2-border-hover)",
          "border-light": "var(--v2-border-light)",
          bg: "var(--v2-bg-app)",
          card: "var(--v2-bg-card)",
          "card-hover": "var(--v2-bg-card-hover)",
          positive: "var(--v2-positive)",
          "positive-bg": "var(--v2-positive-bg)",
          negative: "var(--v2-negative)",
          "negative-bg": "var(--v2-negative-bg)",
          warning: "var(--v2-warning)",
          "warning-bg": "var(--v2-warning-bg)",
          sidebar: "var(--v2-sidebar-bg)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "v2-card": "var(--v2-radius-card)",
        "v2-btn": "var(--v2-radius-btn)",
        "v2-input": "var(--v2-radius-input)",
      },
      boxShadow: {
        "v2-sm": "var(--v2-shadow-sm)",
        "v2-md": "var(--v2-shadow-md)",
        "v2-lg": "var(--v2-shadow-lg)",
        "v2-card": "var(--v2-shadow-card)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
