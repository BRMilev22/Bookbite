/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // HeroUI components
    "./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        tableease: {
          primary: '#e2e76f',
          secondary: '#d3d45f',
          accent: '#e9ecb1',
          dark: '#1a1a1a',
          darkgray: '#252525',
          lightgray: '#3a3a3a',
          textlight: '#ffffff',
          textgray: '#a0a0a0',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

