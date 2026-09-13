/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#F6F0E6',
        embers: {
          50: '#FDF4EC',
          100: '#FBE7D4',
          300: '#EFB27C',
          500: '#E07A3F',
          600: '#C7602A',
          700: '#9C4A20',
        },
        hearth: {
          900: '#241C18',
          800: '#332821',
          700: '#463730',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        warm: '0 8px 30px -10px rgba(36, 28, 24, 0.25)',
      },
    },
  },
  plugins: [],
}
