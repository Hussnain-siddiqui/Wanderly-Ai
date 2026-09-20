// Tailwind theme for Wanderly AI (loaded right after the Tailwind Play CDN script)
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0E2A3B',
        brand: {
          50: '#E9F7F8', 100: '#CDEEF0', 200: '#9EDDE2', 300: '#6CC8D0', 400: '#3BB0BC',
          500: '#1F97A5', 600: '#177C89', 700: '#146470', 800: '#134F59', 900: '#123F47',
        },
        sun: { DEFAULT: '#FFB43B', 400: '#FFC15E' },
      },
    },
  },
};
