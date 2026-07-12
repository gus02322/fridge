import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import AuthScreen from './auth/AuthScreen'
import { CloudProvider } from './data/CloudStore'
import './index.css'

// Porte d'entrée : tant que l'auth se résout on patiente ; sans utilisateur on
// affiche l'écran de connexion ; connecté, on charge ses données puis l'app.
function Root() {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-display text-slate-400">
        <span className="animate-pulse text-lg">🧊 …</span>
      </div>
    )
  }

  if (!user) return <AuthScreen />

  return (
    <CloudProvider uid={user.uid}>
      <App />
    </CloudProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>,
)
