/** @type {import('tailwindcss').Config} */
export default {
  // O CAMPO 'CONTENT' DIZ AO TAILWIND ONDE PROCURAR AS SUAS CLASSES
  content: [
    "./index.html",
    // Esta linha aponta para TUDO DENTRO da sua pasta 'src'
    // (onde agora estão o App.tsx, pages, components, etc.)
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}