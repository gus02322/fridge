import { useState } from 'react'
import { useCloudState } from '../data/CloudStore'
import { SEXES, ACTIVITES, besoinCalorique } from '../utils/nutrition'

const DEFAULT = { sexe: 'femme', age: 30, poids: 65, taille: 168, activite: 'actif' }

// Profil utilisateur + besoin calorique quotidien (Mifflin-St Jeor).
// Le résultat est stocké dans le profil persisté.
export default function ProfileView() {
  const [profil, setProfil] = useCloudState('frigo.profil.v1', {
    ...DEFAULT,
    besoin: besoinCalorique(DEFAULT),
  })

  // Brouillons de saisie par champ : permettent de vider/retaper un nombre
  // librement (sans « 0 » fantôme) pendant l'édition.
  const [drafts, setDrafts] = useState({})

  function patch(p) {
    setProfil((prev) => {
      const next = { ...prev, ...p }
      return { ...next, besoin: besoinCalorique(next) }
    })
  }

  const num = (key, label, unit, min, max) => {
    // Pendant l'édition on affiche le brouillon ; sinon la valeur du profil.
    const shown = key in drafts ? drafts[key] : String(profil[key] ?? '')
    return (
      <label className="flex flex-col gap-1">
        <span className="font-display text-xs font-800 text-slate-500">{label}</span>
        <div className="flex items-center gap-2 rounded-2xl border-2 border-white bg-white/80 px-3 py-2 shadow-tile">
          <input
            type="text"
            inputMode="numeric"
            value={shown}
            onChange={(e) => {
              // chiffres uniquement, sans zéros en tête
              const v = e.target.value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
              setDrafts((d) => ({ ...d, [key]: v }))
              if (v !== '') patch({ [key]: Number(v) })
            }}
            onBlur={() => {
              // À la sortie du champ : on borne la valeur et on lâche le brouillon
              // (un champ laissé vide revient à la dernière valeur du profil).
              const raw = drafts[key]
              if (raw != null && raw !== '') {
                const clamped = Math.min(max, Math.max(min, Number(raw)))
                if (clamped !== Number(raw)) patch({ [key]: clamped })
              }
              setDrafts((d) => {
                const { [key]: _drop, ...rest } = d
                return rest
              })
            }}
            className="w-full bg-transparent font-display text-lg font-800 text-slate-700 outline-none"
          />
          <span className="text-xs font-700 text-slate-400">{unit}</span>
        </div>
      </label>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-2 px-1">
        <span className="text-2xl">👤</span>
        <div>
          <h2 className="font-display text-xl font-800 leading-none text-slate-800">
            Mon profil
          </h2>
          <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400">
            Pour estimer tes besoins
          </p>
        </div>
      </div>

      {/* Sexe */}
      <div className="grid grid-cols-2 gap-2">
        {SEXES.map((s) => (
          <button
            key={s.id}
            onClick={() => patch({ sexe: s.id })}
            className={`rounded-2xl border-2 py-3 font-display text-sm font-800 transition ${
              profil.sexe === s.id
                ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                : 'border-white bg-white/80 text-slate-500'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {num('age', 'Âge', 'ans', 10, 100)}
        {num('poids', 'Poids', 'kg', 30, 250)}
        {num('taille', 'Taille', 'cm', 120, 230)}
      </div>

      {/* Activité */}
      <div>
        <span className="mb-1 block px-1 font-display text-xs font-800 text-slate-500">
          Niveau d'activité
        </span>
        <div className="grid grid-cols-3 gap-2">
          {ACTIVITES.map((a) => (
            <button
              key={a.id}
              onClick={() => patch({ activite: a.id })}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 font-display text-xs font-800 transition ${
                profil.activite === a.id
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                  : 'border-white bg-white/80 text-slate-500'
              }`}
            >
              <span className="text-xl">{a.emoji}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Besoin calorique */}
      <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 text-center shadow-tile">
        <p className="font-display text-xs font-800 uppercase tracking-wide text-emerald-500">
          Besoin quotidien estimé
        </p>
        <p className="my-1 font-display text-4xl font-800 text-slate-800">
          {profil.besoin ? `${profil.besoin}` : '—'}
          <span className="ml-1 text-lg text-slate-400">kcal / jour</span>
        </p>
        <p className="text-[11px] font-700 text-slate-400">
          Formule Mifflin-St Jeor · {ACTIVITES.find((a) => a.id === profil.activite)?.label}
        </p>
      </div>

      <p className="px-2 text-center text-[11px] font-600 text-slate-400">
        ⚠️ Estimations ludiques, pas un conseil médical ni un régime.
      </p>
    </div>
  )
}
