/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          yellow: '#FFDE00',
          pink: '#FF6B6B',
          green: '#4ECDC4',
          blue: '#1A535C',
          white: '#F7F9F9',
          black: '#050505',
          purple: '#A06CD5',
          orange: '#FF9F1C',
        },
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'bounce-fast': 'bounce 0.5s infinite',
      }
    },
  },
  plugins: [],
}
