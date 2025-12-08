/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        secondary: '#0ea5e9',
        neutral: '#64748b',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
