/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#93A8D4",
          400: "#6080C4",
          500: "#3D5FAA",
          600: "#2A4490",
          700: "#1E3A7A",
          800: "#162D63",
          900: "#0F2050",
        },
        orange: {
          400: "#FB923C",
          500: "#F97316",
          600: "#EA6C0A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
