
import type {Config} from 'tailwind-merge';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Playfair Display', 'serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulsate': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        'ring': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '5%, 15%, 25%': { transform: 'rotate(15deg)' },
          '10%, 20%, 30%': { transform: 'rotate(-15deg)' },
          '35%': { transform: 'rotate(0deg)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '33%': { opacity: '0.7' },
          '34%': { opacity: '1' },
          '66%': { opacity: '0.2' },
          '67%': { opacity: '1' },
        },
        'flag-wave': {
          '0%': { transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skewX(0deg)' },
          '20%': { transform: 'perspective(1200px) rotateX(2deg) rotateY(12deg) rotateZ(-1deg) skewX(2deg)' },
          '40%': { transform: 'perspective(1200px) rotateX(-3deg) rotateY(20deg) rotateZ(12deg) skewX(-2deg)' },
          '60%': { transform: 'perspective(1200px) rotateX(4deg) rotateY(15deg) rotateZ(-0.5deg) skewX(1deg)' },
          '80%': { transform: 'perspective(1200px) rotateX(-1deg) rotateY(8deg) rotateZ(0.5deg) skewX(-1deg)' },
          '100%': { transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skewX(0deg)' },
        },
        'flag-ripple': {
          '0%': { backgroundPosition: '0% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        'flag-ripple-alt': {
          '0%': { backgroundPosition: '300% 0' },
          '100%': { backgroundPosition: '0% 0' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': 'left center' },
          '50%': { 'background-position': 'right center' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'pulsate': 'pulsate 1.5s ease-in-out infinite',
        'ring': 'ring 2s ease-in-out infinite',
        'flicker': 'flicker 0.2s linear infinite',
        'flag-wave': 'flag-wave 6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
        'flag-ripple': 'flag-ripple 5s linear infinite',
        'flag-ripple-alt': 'flag-ripple-alt 4s linear infinite',
        'gradient-x': 'gradient-x 5s ease infinite',
        'marquee': 'marquee 80s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
