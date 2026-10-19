import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { ink: '#050508', neon: '#00ffb0', violet: '#7b2fff' } } },
  plugins: [],
};
export default config;
