import { useMemo, useState } from 'react'
import { useCloudState } from './data/CloudStore'
import { useAuth } from './auth/AuthProvider'
import { nomsMatch } from './utils/planning'
import InventoryView from './components/InventoryView'
import MenuView from './components/MenuView'
import WeekView from './components/WeekView'
import ProfileView from './components/ProfileView'

const STORAGE_KEY = 'frigo.items.v1'

const TABS = [
  { id: 'frigo', label: 'Frigo', emoji: '🧊' },
  { id: 'cuisine', label: 'Cuisine', emoji: '🍳' },
  { id: 'semaine', label: 'Semaine', emoji: '📅' },
  { id: 'profil', label: 'Profil', emoji: '👤' },
]

export default function App() {
  const { user, logOut } = useAuth()
  const [items, setItems] = useCloudState(STORAGE_KEY, [])
  const [muted, setMuted] = useCloudState('frigo.muted.v1', false)
  const [view, setView] = useState('frigo')

  // Total "collecté" affiché dans le compteur du bandeau.
  const total = useMemo(
    () =>
      items.reduce(
        (n, it) => n + (it.type === 'staple' ? 1 : it.quantite || 0),
        0,
      ),
    [items],
  )

  // Ajout / fusion d'un item collecté.
  function collect(tpl, extras) {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === tpl.id)
      if (existing) {
        return prev.map((x) => {
          if (x.id !== tpl.id) return x
          if (tpl.type === 'staple') return { ...x, present: true }
          if (tpl.unite === 'niveau') return { ...x, quantite: extras.quantite }
          return { ...x, quantite: Math.min(99, x.quantite + extras.quantite) }
        })
      }
      const base = {
        id: tpl.id,
        nom: tpl.nom,
        icon: tpl.icon,
        categorie: tpl.categorie,
        zone: tpl.zone,
        type: tpl.type,
        unite: tpl.unite,
      }
      return tpl.type === 'staple'
        ? [...prev, { ...base, present: true }]
        : [...prev, { ...base, quantite: extras.quantite }]
    })
  }

  const actions = {
    inc: (id) =>
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, quantite: Math.min(x.unite === 'niveau' ? 3 : 99, x.quantite + 1) }
            : x,
        ),
      ),
    dec: (id) =>
      setItems((prev) =>
        prev.flatMap((x) => {
          if (x.id !== id) return [x]
          return x.quantite <= 1 ? [] : [{ ...x, quantite: x.quantite - 1 }]
        }),
      ),
    toggle: (id) =>
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, present: x.present === false } : x)),
      ),
    remove: (id) => setItems((prev) => prev.filter((x) => x.id !== id)),
  }

  // "J'ai cuisiné" : décrémente du frigo les ingrédients TRACKÉS consommés
  // par une recette (déjà mise à l'échelle). Les staples ne bougent pas.
  // Renvoie le nombre d'items du frigo réellement touchés (pour le feedback).
  function cookRecette(scaled) {
    const besoins = scaled.ingredients.filter((i) => i.present)
    const touched = items.filter(
      (it) =>
        it.type === 'tracke' &&
        besoins.some((ing) => nomsMatch(ing.nom, it.nom)),
    ).length

    setItems((prev) => {
      let next = prev
      for (const ing of besoins) {
        next = next.flatMap((it) => {
          if (it.type !== 'tracke' || !nomsMatch(ing.nom, it.nom)) return [it]
          const conso = it.unite === 'niveau' ? 1 : ing.quantite ?? 1
          const q = it.quantite - conso
          return q > 0 ? [{ ...it, quantite: q }] : []
        })
      }
      return next
    })

    return touched
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-3 pb-10 pt-4">
      {/* Bandeau */}
      <header className="mb-3 flex items-center gap-2">
        <span className="text-2xl">🧊</span>
        <h1 className="font-display text-xl font-800 leading-none text-slate-800">Mon Frigo</h1>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
            <span className="text-sm">🧺</span>
            <span className="font-display text-sm font-800 text-slate-700">{total}</span>
          </div>
          <button
            onClick={() => setMuted((m) => !m)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-base shadow-sm ring-1 ring-black/5 transition active:translate-y-0.5"
            title={muted ? 'Activer le son' : 'Couper le son'}
            aria-label="Son"
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={logOut}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-base shadow-sm ring-1 ring-black/5 transition active:translate-y-0.5"
            title={`Connecté : ${user?.email ?? ''} — se déconnecter`}
            aria-label="Se déconnecter"
          >
            👋
          </button>
        </div>
      </header>

      {/* Onglets */}
      <div className="mb-4 grid grid-cols-4 gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 font-display text-[11px] font-800 shadow-chunky transition active:translate-y-0.5 ${
              view === tab.id
                ? 'bg-slate-800 text-white'
                : 'bg-white/80 text-slate-500 hover:bg-white'
            }`}
          >
            <span className="text-lg leading-none">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'frigo' && (
        <InventoryView
          items={items}
          actions={actions}
          collect={collect}
          muted={muted}
        />
      )}
      {view === 'cuisine' && <MenuView items={items} muted={muted} />}
      {view === 'semaine' && <WeekView onCook={cookRecette} muted={muted} />}
      {view === 'profil' && <ProfileView />}

      {/* Mention discrète */}
      <p className="mt-8 text-center text-[10px] font-600 text-slate-300">
        Estimations ludiques, pas un conseil médical ni un régime.
      </p>
    </div>
  )
}
