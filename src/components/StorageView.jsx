import ItemCard from './ItemCard'

// Décor intérieur de chaque meuble ouvert.
const INTERIOR = {
  frigo: {
    wall: 'linear-gradient(#eaf9ff, #d3eefb)',
    shelf: '#bfe4f2',
    label: 'Frigo ouvert',
    empty: '🧊',
  },
  sec: {
    wall: 'linear-gradient(#f7ecd6, #ecd6ac)',
    shelf: '#cda666',
    label: 'Placard ouvert',
    empty: '🥫',
  },
  epices: {
    wall: 'linear-gradient(#fdeadf, #f6d2c1)',
    shelf: '#d98567',
    label: 'Étagère à épices',
    empty: '🧂',
  },
}

// Vue "meuble ouvert" : les items rangés sur des étagères, avec tous les
// contrôles habituels (stepper, présence, suppression). Logique inchangée.
export default function StorageView({ zone, items, actions, onBack, onAdd }) {
  const deco = INTERIOR[zone.id] ?? INTERIOR.frigo

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barre d'en-tête */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-white/85 px-3 font-display text-sm font-800 text-slate-600 shadow-tile transition active:translate-y-0.5"
        >
          <span className="text-lg leading-none">‹</span> Cuisine
        </button>
        <div className="flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 shadow-tile">
          <span className="text-xl">{zone.emoji}</span>
          <span className="font-display text-base font-800 text-slate-700">{zone.nom}</span>
          <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-100 px-1.5 font-display text-xs font-800 text-slate-500">
            {items.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="ml-auto flex h-11 items-center gap-1.5 rounded-2xl bg-emerald-400 px-4 font-display text-sm font-800 text-white shadow-chunky transition hover:bg-emerald-500 active:translate-y-0.5"
        >
          <span className="text-lg leading-none">＋</span> Ranger
        </button>
      </div>

      {/* Intérieur du meuble */}
      <div
        className="relative overflow-hidden rounded-[2rem] border-2 border-white p-4 shadow-tile"
        style={{ background: deco.wall }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-60"
          style={{ background: deco.shelf }}
        />
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/70 bg-white/30 py-14 text-center">
            <span className="text-5xl opacity-50">{deco.empty}</span>
            <p className="mt-2 px-6 font-display text-base font-800 text-slate-500">
              Ce meuble est vide. Appuie sur « Ranger » pour le remplir !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="animate-slideUp rounded-2xl pb-2"
                style={{ boxShadow: `0 3px 0 ${deco.shelf}66` }}
              >
                <ItemCard
                  item={item}
                  onInc={() => actions.inc(item.id)}
                  onDec={() => actions.dec(item.id)}
                  onToggle={() => actions.toggle(item.id)}
                  onRemove={() => actions.remove(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
