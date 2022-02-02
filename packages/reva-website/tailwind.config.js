const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.elm"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Marianne", ...defaultTheme.fontFamily.sans],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            code: {
              backgroundColor: colors.blue[50],
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            strong: {
              fontWeight: "700",
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
