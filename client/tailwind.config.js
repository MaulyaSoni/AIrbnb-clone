/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb brand palette
        "airbnb-red": "#FF385C",
        "airbnb-red-dark": "#E61E4D",
        "airbnb-pink": "#FF5A5F",
        "airbnb-gray": "#717171",
        "airbnb-light": "#F7F7F7",
        "airbnb-dark": "#222222",

        // Semantic aliases
        primary: {
          DEFAULT: "#FF385C",  // main red
          dark: "#E53251",
        },
        background: {
          light: "#F7F7F7",
          dark: "#1a202c",
        },
        text: {
          light: "#222222",
          dark: "#E2E8F0",
        },
        card: {
          light: "#FFFFFF",
          dark: "#2D3748",
        },
        border: {
          light: "#DDDDDD",
          dark: "#4A5568",
        },
      },
      fontFamily: {
        sans: ["Circular", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        "airbnb": "0 6px 16px rgba(0,0,0,0.12)",
        "airbnb-hover": "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
