/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F0E6',
        },
        sidebar: {
          DEFAULT: '#111111',
        },
        accent: {
          pink: '#F8D4E5',
          blue: '#C8D9F7',
          yellow: '#F5DE74',
          green: '#B8E3A1',
        },
        dark: {
          DEFAULT: '#111111',
        }
      },
      borderRadius: {
        '24': '24px',
        'button': '999px',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 32px rgb(0 0 0 / 0.02)',
        'premium': '0 12px 40px rgb(0 0 0 / 0.03)',
      }
    },
  },
  plugins: [],
}
