/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta tomada del logotipo del grupo de investigación
        naranja: '#E8863A',
        rojo: '#D04C3B',
        cafe: '#A0614E',
        marino: { DEFAULT: '#16213A', 700: '#24314F', 500: '#4A5672', 300: '#8C94A8' },
        papel: '#F5F4F1',
        linea: '#E3E0DA',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
