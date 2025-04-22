/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx}',
    './index.html',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '480px',
      },      
      fontFamily: {
        sans: ['Space Mono', 'monospace'],
        mono: ['Space Mono', 'monospace'],
      },
      fontSize: {
        'text-small': '0.875rem',
        'text-medium': '1rem',
        'text-large': '1.25rem',
        'text-xlarge': '1.5rem',
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          border: "hsl(var(--card-border))",
        },
        scrollbar: {
          track: "hsl(var(--scrollbar-track))",
          thumb: "hsl(var(--scrollbar-thumb))",
          hover: "hsl(var(--scrollbar-hover))",
        },
      },
      borderRadius: {
        lg: "0", 
        md: "0", 
        sm: "0",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            fontFamily: 'Space Mono, monospace',
            img: {
              maxWidth: '100%', 
              height: 'auto',
              margin: '1.5rem 0',
              borderRadius: '0'
            },
            code: {
              fontFamily: 'Space Mono, monospace',
            },
            pre: {
              fontFamily: 'Space Mono, monospace',
            },
          },
        },
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
        "carousel-scroll": {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "carousel-scroll": "carousel-scroll 30s linear infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
