import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-orbitron)'],
        sans: ['var(--font-inter)']
      },
      backgroundImage: {
        'starfield': 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.15), transparent 60%), radial-gradient(circle at 80% 0%, rgba(236,72,153,0.15), transparent 55%), radial-gradient(circle at 50% 100%, rgba(129,140,248,0.2), transparent 65%)'
      },
      boxShadow: {
        neon: '0 0 20px rgba(56, 189, 248, 0.25)',
        innerGlow: 'inset 0 0 30px rgba(148, 163, 184, 0.25)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

export default config;
