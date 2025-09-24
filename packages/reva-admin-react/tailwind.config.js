module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        blue: {
          "light-text-default-info": "#0063CB",
        },
        "light-text-mention-grey": "#666",
        dsfr: {
          "blue-france-sun-113": "#000091",
          orange: { 500: "#f94608" },
          "light-text-mention-grey": "#666666",
          "light-neutral-grey-1000": "#F6F6F6",
          "light-decisions-text-default-warning": "#B34000",
          "light-decisions-background-contrast-warning": "#FFE9E6",
          "light-decisions-border-border-default-grey": "#DDDDDD",
          "light-decisions-border-border-disabled-grey": "#E5E5E5",
          "light-decisions-text-disabled-grey": "#929292",
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
        dsfrGray: {
          contrast: "#EEEEEE",
          altblueFrance: "#F5F5FE",
          mentionGrey: "#666666",
          labelGrey: "#161616",
          defaultGrey: "#FFFFFF",
          titleGrey: "#161616",
        },
      },
      listStyleType: {
        square: "square",
      },
      backgroundColor: {
        "light-grey": "#F6F6F6",
      },
      boxShadow: {
        lifted: "0 6px 18px rgba(0, 0, 18, 16%)",
      },
    },
  },
  plugins: [],
};
