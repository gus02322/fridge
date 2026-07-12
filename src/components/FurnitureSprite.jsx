// ─────────────────────────────────────────────────────────────
//  <FurnitureSprite /> — point d'entrée UNIQUE pour le visuel d'un meuble
//  de la cuisine (frigo, placards, étagère à épices).
//
//  Pour l'instant : une illustration "placeholder" en CSS (formes rondes,
//  couleurs douces, ombres tendres, petit côté jeu vidéo). Plus tard, il
//  suffira de remplir SPRITE_SOURCES avec de vraies images isométriques par
//  meuble et de rendre <img> à la place — sans toucher au reste de l'app.
// ─────────────────────────────────────────────────────────────

// Emplacement futur des sprites isométriques, indexés par type de meuble.
// Ex. plus tard : { fridge: '/sprites/iso/fridge.png', ... }
const SPRITE_SOURCES = {
  // fridge: null, placards: null, epices: null
}

// Palette + décor de chaque meuble (placeholder illustré).
const FURNITURE = {
  fridge: {
    body: ['#eaf9ff', '#c4ecfa'],
    edge: '#7fd1e8',
    panel: ['#ffffff', '#d9f2fc'],
    handle: '#8ecfe6',
    emoji: '🧊',
  },
  placards: {
    body: ['#f7e6c8', '#e7c592'],
    edge: '#cfa25f',
    panel: ['#fbf0d8', '#eccf9c'],
    handle: '#b7823f',
    emoji: '🥫',
  },
  epices: {
    body: ['#fbe0d3', '#f0b79f'],
    edge: '#d98567',
    panel: ['#fdeee6', '#f4c8b4'],
    handle: '#c26a4c',
    emoji: '🧂',
  },
}

export default function FurnitureSprite({ kind = 'fridge', className = '', style }) {
  const f = FURNITURE[kind] ?? FURNITURE.fridge
  const sprite = SPRITE_SOURCES[kind]

  if (sprite) {
    return <img src={sprite} alt="" className={`h-full w-full object-contain ${className}`} style={style} />
  }

  // Placeholder illustré : corps arrondi + 2 "portes"/étagères + poignées.
  return (
    <div
      className={`relative ${className}`}
      style={{
        borderRadius: 22,
        background: `linear-gradient(160deg, ${f.body[0]}, ${f.body[1]})`,
        boxShadow: `inset 0 0 0 3px ${f.edge}55, 0 14px 0 rgba(0,0,0,0.10), 0 22px 30px rgba(0,0,0,0.12)`,
        ...style,
      }}
      aria-hidden="true"
    >
      {/* fente centrale (deux portes) */}
      <div
        className="absolute inset-x-3 top-3 bottom-3 grid grid-rows-2 gap-2"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="relative rounded-2xl"
            style={{
              background: `linear-gradient(160deg, ${f.panel[0]}, ${f.panel[1]})`,
              boxShadow: `inset 0 0 0 2px ${f.edge}33`,
            }}
          >
            {/* poignée */}
            <span
              className="absolute right-2 top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full"
              style={{ background: f.handle }}
            />
          </div>
        ))}
      </div>
      {/* petit badge emoji du meuble */}
      <span className="absolute -left-2 -top-2 text-2xl drop-shadow-sm">{f.emoji}</span>
    </div>
  )
}
