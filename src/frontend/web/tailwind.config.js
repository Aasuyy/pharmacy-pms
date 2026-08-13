/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: "#050505",
        "neon-green": "#39ff14",
        "neon-cyan": "#22d3ee",
        "neon-amber": "#fbbf24",
        "neon-purple": "#a78bfa",
      },
    },
  },
  plugins: [],
};
