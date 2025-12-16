/** @type {import('tailwindcss').Config} */
export default {
  // O CONTENT AGORA FOCA SOMENTE NA PASTA 'SRC'
  content: [
    // Se o index.html não tem classes Tailwind diretamente, pode ser removido
    // Deixe apenas a linha que aponta para o código-fonte:
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}