/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rec: {
          blue: {
            DEFAULT: "#0F2C59",
            dark: "#081C38",
            light: "#1D4ED8",
            subtle: "#EFF6FF",
          },
          gold: {
            DEFAULT: "#E5A93B",
            light: "#FCD34D",
            hover: "#D99726",
          },
          maroon: "#800000",
          card: "#FFFFFF",
          mapbg: "#EAE6DF",
          road: "#5C6B73",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 44, 89, 0.12)',
        'card': '0 4px 20px -2px rgba(15, 44, 89, 0.08)',
      }
    },
  },
  plugins: [],
}
