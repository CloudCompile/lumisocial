export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0a',
        accent: '#4f8ef7',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-heart': 'pulse 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
};
