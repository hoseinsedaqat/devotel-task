/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // if using /app directory (Next.js 13+)
    "./pages/**/*.{js,ts,jsx,tsx}", // if you have /pages directory
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};