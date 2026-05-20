/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sindata: {
          50: '#ecfeff',
          100: '#cffafe',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#0c3547'
        }
      },
      boxShadow: {
        soft: '0 10px 35px -18px rgba(12, 53, 71, 0.35)'
      }
    }
  },
  plugins: []
};
