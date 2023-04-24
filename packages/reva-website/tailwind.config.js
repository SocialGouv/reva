/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1248px",
      },
      colors: {
        dsfrGray: { contrast: "#EEEEEE" },
      },
    },
  },
  plugins: [],
};
