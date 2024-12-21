/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'
import plugin from 'tailwindcss/plugin'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        gray: colors.slate,
        'purple': {
          600: '#582C83',
          700: '#472368',
          800: '#361A4D',
          900: '#251232',
        }
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            a: {
              color: theme('colors.purple.600'),
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                color: theme('colors.purple.800'),
                textDecoration: 'underline',
              },
            },
            h1: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            h3: {
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    plugin(function({ addBase, theme }) {
      addBase({
        'html': { fontFamily: theme('fontFamily.sans') },
      })
    }),
  ],
}