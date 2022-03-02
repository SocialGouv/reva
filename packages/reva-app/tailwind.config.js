const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { blue: { 600: "#0078f3" }, slate: { 900: "#21203d" } },
      fontFamily: {
        sans: ["Marianne", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
