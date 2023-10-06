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
        dsfrGray: {
          contrast: "#EEEEEE",
          altblueFrance: "#F5F5FE",
          mentionGrey: "#666666",
          labelGrey: "#161616",
          defaultGrey: "#FFFFFF",
          titleGrey: "#161616",
        },
        dsfrBlue: { franceSun: "#000091", openBlueFrance: "#E3E3FD" },
      },
    },
  },
  plugins: [],
};
