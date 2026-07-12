import { useState } from 'react'
import { useAuth } from './AuthProvider'

// Messages Firebase → français lisible.
function messageFor(code) {
  switch (code) {
    case 'auth/invalid-email':
      return "L'adresse e-mail n'est pas valide."
    case 'auth/missing-password':
      return 'Entre un mot de passe.'
    case 'auth/weak-password':
      return 'Mot de passe trop court (6 caractères minimum).'
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet e-mail. Connecte-toi.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou mot de passe incorrect.'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessaie dans un instant.'
    case 'auth/network-request-failed':
      return 'Problème de réseau. Vérifie ta connexion.'
    case 'auth/operation-not-allowed':
      return "La connexion par e-mail n'est pas activée côté Firebase (voir la console)."
    default:
      return "Une erreur est survenue. Réessaie."
  }
}

export default function AuthScreen() {
  const { signUp, logIn } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (isSignup) await signUp(email.trim(), password)
      else await logIn(email.trim(), password)
      // La suite est gérée par onAuthStateChanged (l'app s'affiche).
    } catch (err) {
      setError(messageFor(err?.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-5xl">🧊</div>
          <h1 className="mt-2 font-display text-3xl font-800 text-slate-800">Mon Frigo</h1>
          <p className="font-body text-sm font-600 text-slate-400">
            {isSignup ? 'Crée ton compte pour commencer' : 'Connecte-toi pour retrouver ton frigo'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-3xl border-2 border-white bg-white/80 p-5 shadow-tile"
        >
          <label className="block">
            <span className="mb-1 block font-display text-xs font-800 text-slate-500">E-mail</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              className="w-full rounded-2xl border-2 border-white bg-white px-3 py-2.5 font-body text-slate-700 shadow-tile outline-none focus:border-emerald-300"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-display text-xs font-800 text-slate-500">
              Mot de passe
            </span>
            <input
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border-2 border-white bg-white px-3 py-2.5 font-body text-slate-700 shadow-tile outline-none focus:border-emerald-300"
              required
            />
          </label>

          {error && (
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-2.5 font-body text-sm font-700 text-rose-600">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-emerald-400 px-5 py-3 font-display text-base font-800 text-white shadow-chunky transition hover:bg-emerald-500 active:translate-y-0.5 disabled:opacity-60"
          >
            {busy ? '…' : isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-center font-body text-sm font-600 text-slate-400">
          {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button
            type="button"
            onClick={() => {
              setError(null)
              setMode(isSignup ? 'login' : 'signup')
            }}
            className="font-800 text-emerald-500 underline-offset-2 hover:underline"
          >
            {isSignup ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  )
}
