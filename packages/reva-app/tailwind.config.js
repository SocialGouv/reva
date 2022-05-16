const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      colors: {
        blue: { 600: "#0078f3" },
        gray: { 450: "#8C8E97" },
        purple: { 100: "#F6E0FF", 800: "#89509F" },
        slate: { 100: "#f3f3fe", 400: "#908eac", 900: "#21203D" },
      },
      fontFamily: {
        sans: ["Marianne", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
