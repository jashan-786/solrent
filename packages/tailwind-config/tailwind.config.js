/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#F8FAFC',
          secondary: '#F1F5F9',
          dark: '#020617',
        },
        brand: {
          navy: '#0F172A',
        },
        text: {
          strong: '#1E293B',
          muted: '#64748B',
        },
        solrent: {
          emerald: '#10B981',
          surface: '#ECFDF5',
          indigo: '#6366F1',
        },
      },
      borderRadius: {
        'twelve': '12px',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
