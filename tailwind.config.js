/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0C4A28',
          light: '#0F5C32',
          dark: '#0A3D20',
        },
        card: {
          DEFAULT: '#F0F4F1',
          border: '#D8DDD9',
          text: '#1A2E1F',
          muted: '#5A7A62',
        },
        emerald: {
          game: '#00A859',
        },
        chip: {
          scout: '#F59E0B',
          show: '#38BDF8',
        },
        score: {
          player: '#00A859',
          ai: '#F87171',
          round: '#FBBF24',
          turn: '#22D3EE',
        },
      },
      fontFamily: {
        display: ['Recoleta', 'Cooper Black', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        modal: '24px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
}
