import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// La clé Anthropic n'est JAMAIS exposée au client : le navigateur appelle
// un chemin relatif (/v1/messages) et ce proxy de dev y injecte la clé
// côté serveur, depuis l'environnement. "Pas de clé à passer" côté front.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY

  return {
    // Sur GitHub Pages, l'app est servie sous /fridge/ (project page).
    // En dev on garde la racine pour ne pas déranger `npm run dev`.
    base: command === 'build' ? '/fridge/' : '/',
    plugins: [react()],
    server: {
      proxy: {
        '/v1': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiKey) proxyReq.setHeader('x-api-key', apiKey)
              proxyReq.setHeader('anthropic-version', '2023-06-01')
            })
          },
        },
      },
    },
  }
})
