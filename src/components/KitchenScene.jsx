import FurnitureSprite from './FurnitureSprite'

const TYPE_FOR = { frigo: 'fridge', sec: 'placards', epices: 'epices' }

// Placement de chaque meuble dans le coin de la pièce (en % de la scène).
// épices = au mur (en haut-gauche) ; frigo & placard = au sol.
const LAYOUT = {
  epices: { left: '5%', top: '8%', width: '44%', height: '20%' },
  frigo: { left: '7%', top: '34%', width: '36%', height: '58%' },
  sec: { left: '48%', top: '46%', width: '46%', height: '46%' },
}

// La scène : un coin de cuisine minimaliste et calme, deux murs qui se
// rejoignent, un sol en perspective, une lumière douce venant de la droite.
export default function KitchenScene({ zones, counts, onOpen }) {
  // Ordre de rendu : le meuble le plus "au fond" d'abord.
  const order = ['epices', 'frigo', 'sec']
  const byId = Object.fromEntries(zones.map((z) => [z.id, z]))

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(60,50,40,0.14)] ring-1 ring-black/5">
        {/* ---- LA PIÈCE (coin : 2 murs + sol) ---- */}
        {/* mur gauche (légèrement dans l'ombre près du coin) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 50% 0, 50% 60%, 0 74%)',
            background: 'linear-gradient(90deg, #efe9e1 0%, #e4ddd2 100%)',
          }}
        />
        {/* mur droit (mieux éclairé) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(50% 0, 100% 0, 100% 74%, 50% 60%)',
            background: 'linear-gradient(90deg, #efe9e0 0%, #f6f1ea 100%)',
          }}
        />
        {/* sol (perspective : arête en V vers le coin) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 74%, 50% 60%, 100% 74%, 100% 100%, 0 100%)',
            background: 'linear-gradient(180deg, #ddceb6 0%, #cdbb9f 100%)',
          }}
        />
        {/* occlusion douce à la jonction mur/sol */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 74%, 50% 60%, 100% 74%, 100% 79%, 50% 66%, 0 79%)',
            background: 'rgba(70,55,40,0.14)',
            filter: 'blur(2px)',
          }}
        />
        {/* arête verticale du coin (ombre douce) */}
        <div
          className="absolute top-0"
          style={{
            left: 'calc(50% - 14px)',
            width: '28px',
            height: '60%',
            background: 'linear-gradient(90deg, rgba(70,55,40,0) 0%, rgba(70,55,40,0.10) 50%, rgba(70,55,40,0) 100%)',
            filter: 'blur(1px)',
          }}
        />
        {/* lumière douce d'ambiance venant de la droite */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 88% 10%, rgba(255,252,245,0.55), rgba(255,252,245,0) 60%)' }}
        />

        {/* ---- LES MEUBLES ---- */}
        {order.map((zid) => {
          const zone = byId[zid]
          if (!zone) return null
          const pos = LAYOUT[zid]
          const n = counts[zid] ?? 0
          return (
            <button
              key={zid}
              onClick={() => onOpen(zid)}
              className="group absolute flex flex-col items-center transition active:scale-[0.98]"
              style={pos}
              title={`Ouvrir : ${zone.nom}`}
            >
              <div className="relative h-full w-full transition-transform duration-200 ease-out group-hover:-translate-y-1">
                <FurnitureSprite type={TYPE_FOR[zid]} className="h-full w-full" />
              </div>
            </button>
          )
        })}

        {/* ---- ÉTIQUETTES + compteurs (au sol, sous les meubles) ---- */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 px-2">
          {zones.map((z) => {
            const n = counts[z.id] ?? 0
            return (
              <span
                key={z.id}
                className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-display text-[11px] font-800 text-slate-600 shadow-sm ring-1 ring-black/5 backdrop-blur"
              >
                {z.emoji} {z.nom}
                <span
                  className="flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-800 text-white"
                  style={{ background: n > 0 ? '#5b8f76' : '#c4bfb6' }}
                >
                  {n}
                </span>
              </span>
            )
          })}
        </div>
      </div>

      <p className="mt-3 text-center font-body text-sm font-600 text-slate-400">
        Tape un meuble pour l'ouvrir 👆
      </p>
    </div>
  )
}
