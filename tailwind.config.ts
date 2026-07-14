import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Tailwind design system for Job Nest UAE.
 *
 * Design direction: Apple / Linear / Stripe Dashboard / Vercel / Notion —
 * minimal, premium, modern SaaS. White canvas, blue gradient accent,
 * glassmorphism, soft diffused shadows, generous spacing, 20px corners.
 *
 * CSS custom properties (defined in app/globals.css) drive every color
 * token so the palette can be retuned in one place without touching
 * components. This file adds the surrounding scales — type, spacing,
 * shadow, blur, z-index, breakpoints — that make up the rest of the
 * design system.
 *
 * Breakpoints (Tailwind defaults, used consistently across the app):
 *   Mobile   < 640px   (default, no prefix)
 *   sm         ≥ 640px  large phones / small tablets
 *   md         ≥ 768px  tablets ("Tablet" in the design spec)
 *   lg         ≥ 1024px desktop ("Desktop" in the design spec)
 *   xl         ≥ 1280px large desktop
 *   2xl        ≥ 1536px wide desktop
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "2.5rem",
        xl: "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // Semantic text tokens — text-text-primary / text-text-secondary.
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
        },
        // Fixed badge palette (independent of the primary/success/etc.
        // semantic tokens, so badge colors don't shift if the brand
        // palette is retuned later).
        badge: {
          blue: { DEFAULT: "hsl(var(--badge-blue))", foreground: "hsl(var(--badge-blue-foreground))" },
          green: { DEFAULT: "hsl(var(--badge-green))", foreground: "hsl(var(--badge-green-foreground))" },
          orange: { DEFAULT: "hsl(var(--badge-orange))", foreground: "hsl(var(--badge-orange-foreground))" },
          purple: { DEFAULT: "hsl(var(--badge-purple))", foreground: "hsl(var(--badge-purple-foreground))" },
          gray: { DEFAULT: "hsl(var(--badge-gray))", foreground: "hsl(var(--badge-gray-foreground))" },
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 12px)",
        md: "calc(var(--radius) - 6px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 8px)",
        "2xl": "20px",
        full: "9999px",
      },
      // Typography scale — Display / H1-H4 / Body / Caption / Small.
      // Consumed directly (text-display, text-h1, ...) or via the
      // <Heading>/<Text> components in components/typography/.
      fontSize: {
        display: ["clamp(2rem, 1.2rem + 5vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["clamp(1.75rem, 1.1rem + 3.5vw, 2.75rem)", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["1.375rem", { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgb(15 23 42 / 0.06), 0 8px 24px -8px rgb(15 23 42 / 0.08)",
        "soft-lg":
          "0 4px 16px -4px rgb(15 23 42 / 0.08), 0 16px 40px -12px rgb(15 23 42 / 0.12)",
        "soft-xl":
          "0 8px 24px -6px rgb(15 23 42 / 0.10), 0 24px 56px -16px rgb(15 23 42 / 0.16)",
        glass: "0 8px 32px 0 rgb(15 23 42 / 0.10)",
        focus: "0 0 0 3px hsl(var(--ring) / 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, hsl(var(--brand-start)) 0%, hsl(var(--brand-end)) 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, hsl(var(--brand-start) / 0.10) 0%, hsl(var(--brand-end) / 0.10) 100%)",
        "brand-gradient-radial":
          "radial-gradient(120% 120% at 0% 0%, hsl(var(--brand-start) / 0.14) 0%, transparent 60%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      // Icon sizing scale — matches Lucide's `size` prop / className.
      // sm=16px (inline text icons), md=20px (default UI icons),
      // lg=24px (buttons/nav), xl=32px (empty states), 2xl=40px (feature icons).
      size: {
        "icon-sm": "1rem",
        "icon-md": "1.25rem",
        "icon-lg": "1.5rem",
        "icon-xl": "2rem",
        "icon-2xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        instant: "100ms",
        fast: "150ms",
        DEFAULT: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      // Centralized z-index scale — avoids ad-hoc z-[9999] values creeping
      // into components. dropdown < sticky < overlay < modal < toast.
      zIndex: {
        base: "0",
        dropdown: "20",
        sticky: "30",
        header: "40",
        overlay: "50",
        modal: "60",
        popover: "70",
        toast: "80",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "spin-slow": "spin-slow 1.2s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
