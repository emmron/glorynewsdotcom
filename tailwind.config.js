/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'purple': {
          600: '#582C83',
          700: '#472368',
          800: '#361A4D',
          900: '#251232',
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.purple.600'),
              '&:hover': {
                color: theme('colors.purple.800'),
              },
            },
            h1: {
              color: theme('colors.gray.900'),
            },
            h2: {
              color: theme('colors.gray.800'),
            },
            h3: {
              color: theme('colors.gray.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
} 