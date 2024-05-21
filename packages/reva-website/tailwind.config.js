/** @type {import("tailwindcss").Config} */
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
        neutral: {
          100: "#F6F6F6",
          200: "#E5E5E5",
          300: "#DDDDDD",
          400: "#929292",
          500: "#666666",
          700: "#3A3A3A",
          900: "#161616",
        },
        dsfrBlue: { franceSun: "#000091", openBlueFrance: "#E3E3FD" },
      },
      boxShadow: {
        lifted: "0 6px 18px rgba(0, 0, 18, 16%)",
      },
    },
  },
  plugins: [],
};
