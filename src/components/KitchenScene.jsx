import FurnitureSprite from './FurnitureSprite'

// Correspondance zone d'inventaire → meuble de la cuisine.
const FURNITURE_FOR = { frigo: 'fridge', sec: 'placards', epices: 'epices' }

// La scène : une cuisine illustrée, chaleureuse, vue de face avec un léger
// côté "maison de poupée". On tape un meuble pour l'ouvrir.
export default function KitchenScene({ zones, counts, onOpen }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="relative overflow-hidden rounded-[2rem] border-2 border-white shadow-tile"
        style={{ background: 'linear-gradient(#fde7cf 0%, #fbe0c2 52%, #e9c39a 52%, #e2b487 100%)' }}
      >
        {/* --- Ambiance murale --- */}
        {/* fenêtre avec ciel */}
        <div
          className="absolute left-5 top-5 hidden h-24 w-32 rounded-2xl border-[6px] border-white/80 shadow-md sm:block"
          style={{ background: 'linear-gradient(#bfe8ff, #eaf7ff)' }}
        >
          <span className="absolute right-2 top-1.5 text-xl">☀️</span>
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-white/80" />
          <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-white/80" />
        </div>
        {/* suspension lumineuse */}
        <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 flex-col items-center sm:flex">
          <div className="h-8 w-[3px] bg-slate-300/60" />
          <div className="-mt-1 text-3xl drop-shadow">💡</div>
        </div>
        {/* petite plante + tapis */}
        <span className="absolute bottom-3 right-4 text-4xl drop-shadow-sm">🪴</span>
        <div className="absolute bottom-2 left-1/2 h-4 w-52 -translate-x-1/2 rounded-full bg-amber-800/10 blur-[1px]" />

        {/* --- Meubles tappables --- */}
        <div className="relative flex flex-wrap items-end justify-center gap-4 px-5 pb-8 pt-16 sm:gap-8 sm:pt-20">
          {zones.map((zone) => {
            const kind = FURNITURE_FOR[zone.id]
            const n = counts[zone.id] ?? 0
            // Le frigo est plus haut, les placards plus larges.
            const dims =
              kind === 'fridge'
                ? 'w-28 h-48 sm:w-32 sm:h-56'
                : kind === 'placards'
                  ? 'w-36 h-40 sm:w-44 sm:h-44'
                  : 'w-28 h-36 sm:w-32 sm:h-40'
            return (
              <button
                key={zone.id}
                onClick={() => onOpen(zone.id)}
                className="group flex flex-col items-center gap-2 transition active:translate-y-0.5"
                title={`Ouvrir : ${zone.nom}`}
              >
                <div className="relative transition-transform duration-200 group-hover:-translate-y-1.5">
                  <FurnitureSprite kind={kind} className={dims} />
                  {/* pastille compteur */}
                  <span
                    className="absolute -right-2 -top-2 flex h-8 min-w-[2rem] items-center justify-center rounded-full border-2 border-white px-2 font-display text-sm font-800 text-white shadow"
                    style={{ background: n > 0 ? '#34c58a' : '#c7cad2' }}
                  >
                    {n}
                  </span>
                </div>
                <span className="rounded-full bg-white/85 px-3 py-1 font-display text-sm font-800 text-slate-700 shadow-tile">
                  {zone.emoji} {zone.nom}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-3 text-center font-body text-sm font-700 text-slate-400">
        Tape un meuble pour l'ouvrir et voir ce qu'il y a dedans 👆
      </p>
    </div>
  )
}
