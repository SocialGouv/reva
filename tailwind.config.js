const plugin = require('tailwindcss/plugin');
// const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      padding: ['last'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    plugin(function ({ addUtilities }) {
      const capitalizeFirst = {
        '.capitalize-first:first-letter': {
          textTransform: 'uppercase',
        }
      }
      const extendUnderline = {
        '.underline-resport': {
          'textDecoration': 'underline',
          'text-decoration-color': '#17DC2B',
        },
      }
      const bgOverlay = {
        '.bg-overlay': {
          'background': 'linear-gradient(var(--overlay-angle), var(--overlay-colors)), var(--overlay-image)',
          'background-position': 'center',
          'background-size': 'cover',
        }
      }
      addUtilities([capitalizeFirst, bgOverlay, extendUnderline]);
    }),
  ],
}
