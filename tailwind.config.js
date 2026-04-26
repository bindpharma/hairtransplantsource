/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9f6',
          100: '#daf0e7',
          200: '#b6e1cf',
          300: '#86caaf',
          400: '#54ad8b',
          500: '#329070',
          600: '#22735a',
          700: '#1c5c49',
          800: '#18493c',
          900: '#143c32',
          950: '#0a221c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
          },
        },
      },
    },
  },
  plugins: [],
};
