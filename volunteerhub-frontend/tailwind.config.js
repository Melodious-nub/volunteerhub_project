/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#d1e1fd',
          200: '#a3c3fb',
          300: '#75a5f9',
          400: '#4787f7',
          500: '#1a6ef5', // WT Project Primary Blue
          600: '#1558c4',
          700: '#104293',
          800: '#0b2c62',
          900: '#051631',
        },
        accent: {
          50: '#e0faf3',
          100: '#c1f5e7',
          200: '#83ebd0',
          300: '#45e1b9',
          400: '#07d7a2',
          500: '#00c896', // WT Project Accent Green
          600: '#00a078',
          700: '#00785a',
          800: '#00503c',
          900: '#00281e',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
