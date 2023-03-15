const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{elm,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      colors: {
        blue: { 600: "#0078f3" },
        gray: { 450: "#8C8E97" },
        neutral: { 100: "#f7f7f7" },
        purple: { 100: "#F6E0FF", 800: "#89509F" },
        slate: {
          50: "#fbfbff",
          100: "#f3f3fe",
          200: "#e8e8f5",
          400: "#A1A0BA",
          500: "#9A99AD",
          600: "#7c7c9d",
          800: "#19182f",
          900: "#21203D",
        },
        dsfrBlue: { 300: "#E3E3FD", 500: "#000091" },
        dsfrGray: { 500: "#666666", 700: "#3A3A3A", 800: "161616" },
      },
      fontFamily: {
        sans: ["Marianne", ...defaultTheme.fontFamily.sans],
      },
      screens: {
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1248px",
      },
      listStyleType: {
        square: "square",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
