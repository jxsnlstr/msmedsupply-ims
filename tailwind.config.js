/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      inter: ["Inter", "sans-serif"],
    },
    extend: {
      fontSize: {
        xs: ["13px", "18px"],
        sm: ["14px", "20px"],
        base: ["15px", "22px"],
        lg: ["17px", "26px"],
        xl: ["20px", "30px"],
      },
    },
  },
  plugins: [],
};
