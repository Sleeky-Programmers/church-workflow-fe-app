import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e7eff7',
          100: '#b4cde7',
          200: '#8fb5dc',
          300: '#5c94cc',
          400: '#3d7fc2',
          500: '#0c5fb3',
          600: '#0b56a3',
          700: '#09437f',
          800: '#073462',
          900: '#05284b',
        },
        secondary: {
          50:  '#fff1e6',
          100: '#ffd2b0',
          200: '#ffbd8a',
          300: '#ff9f54',
          400: '#ff8c33',
          500: '#ff6f00',
          600: '#e86500',
          700: '#b54f00',
          800: '#8c3d00',
          900: '#6b2f00',
        },
        white: {
          600: '#e8e8e8',
          700: '#b5b5b5',
          800: '#8c8c8c',
          900: '#6b6b6b',
        },
        black: {
          50:  '#e6e6e6',
          100: '#b0b0b0',
          200: '#8a8a8a',
          300: '#545454',
          400: '#333333',
        },
        destructive: {
          50:  '#ffe6e6',
          100: '#ffb0b0',
          200: '#ff8a8a',
          300: '#ff5454',
          400: '#ff3333',
          500: '#ff0000',
          600: '#e80000',
          700: '#b50000',
          800: '#8c0000',
          900: '#6b0000',
        },
        success: {
          50:  '#e6f2e6',
          100: '#b0d8b0',
          200: '#8ac58a',
          300: '#54aa54',
          400: '#339933',
          500: '#008000',
          600: '#007400',
          700: '#005b00',
          800: '#004600',
          900: '#003600',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
