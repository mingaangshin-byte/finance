/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#F4F4F2',
        cardBg: '#FFFFFF',
        answerBg: '#E2E6DF',
        badgeBg: '#E3E5DF',
      },
    },
  },
  plugins: [],
}