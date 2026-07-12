import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plus de backend ni de proxy : les recettes sont lues depuis un fichier
// local (src/data/recipes.json), aucun appel réseau au runtime.
export default defineConfig(({ command }) => ({
  // Sur GitHub Pages, l'app est servie sous /fridge/ (project page).
  // En dev on garde la racine pour ne pas déranger `npm run dev`.
  base: command === 'build' ? '/fridge/' : '/',
  plugins: [react()],
}))
