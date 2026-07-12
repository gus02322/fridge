import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Toutes les données d'un utilisateur vivent dans un seul document Firestore :
//   users/{uid}  ->  { <clé>: <valeur>, ... }
// `useCloudState(key, initial)` remplace `useLocalStorage` avec la MÊME API
// [value, setValue, reset]. Les écritures sont regroupées (debounce) pour ne
// pas taper Firestore à chaque frappe.

const CloudCtx = createContext(null)

// Firestore n'aime pas les points dans les noms de champs → on les échappe.
const toField = (key) => key.replace(/[.$#[\]/]/g, '_')

export function CloudProvider({ uid, children }) {
  const [data, setData] = useState({})
  const [ready, setReady] = useState(false)
  const ref = useRef(null)
  const pending = useRef({}) // champs modifiés en attente d'écriture
  const timer = useRef(null)

  // Charge (une fois) le document de l'utilisateur.
  useEffect(() => {
    let alive = true
    setReady(false)
    ref.current = doc(db, 'users', uid)
    getDoc(ref.current)
      .then((snap) => {
        if (!alive) return
        setData(snap.exists() ? snap.data() : {})
        setReady(true)
      })
      .catch((e) => {
        // En cas d'échec (règles, réseau), on démarre à vide plutôt que bloquer.
        console.error('Firestore load failed:', e)
        if (alive) {
          setData({})
          setReady(true)
        }
      })
    return () => {
      alive = false
    }
  }, [uid])

  // Écriture groupée vers Firestore (merge : n'écrase que les champs changés).
  const flush = useCallback(() => {
    const changes = pending.current
    pending.current = {}
    timer.current = null
    if (ref.current && Object.keys(changes).length) {
      setDoc(ref.current, changes, { merge: true }).catch((e) =>
        console.error('Firestore write failed:', e),
      )
    }
  }, [])

  const setField = useCallback(
    (field, updater) => {
      setData((prev) => {
        const cur = prev[field]
        const next = typeof updater === 'function' ? updater(cur) : updater
        pending.current[field] = next
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(flush, 500)
        return { ...prev, [field]: next }
      })
    },
    [flush],
  )

  // Écrit ce qui reste en attente si l'onglet se ferme.
  useEffect(() => {
    const onHide = () => {
      if (timer.current) flush()
    }
    window.addEventListener('beforeunload', onHide)
    return () => window.removeEventListener('beforeunload', onHide)
  }, [flush])

  return (
    <CloudCtx.Provider value={{ data, ready, setField }}>
      {ready ? children : <CloudSplash />}
    </CloudCtx.Provider>
  )
}

function CloudSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center font-display text-slate-400">
      <span className="animate-pulse text-lg">🧊 Chargement de ton frigo…</span>
    </div>
  )
}

// Même signature que useLocalStorage : [value, setValue, reset].
// `key` reste la clé existante (ex. 'frigo.items.v1') : au premier chargement,
// si le cloud n'a pas encore ce champ mais que localStorage l'a, on migre.
export function useCloudState(key, initial) {
  const ctx = useContext(CloudCtx)
  if (!ctx) throw new Error('useCloudState doit être utilisé dans <CloudProvider>')
  const { data, ready, setField } = ctx
  const field = toField(key)

  const has = data[field] !== undefined
  const value = has ? data[field] : initial

  // Migration douce depuis localStorage (une fois, si le champ n'existe pas).
  useEffect(() => {
    if (!ready || has) return
    try {
      const raw = window.localStorage.getItem(key)
      if (raw != null) setField(field, JSON.parse(raw))
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, has, key, field])

  const setValue = useCallback(
    (v) => {
      setField(field, (cur) => {
        const base = cur !== undefined ? cur : initial
        return typeof v === 'function' ? v(base) : v
      })
    },
    // `initial` peut être recréé à chaque rendu ; on le fige au premier montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, setField],
  )

  const reset = useCallback(
    () => setField(field, initial),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, setField],
  )

  return [value, setValue, reset]
}
