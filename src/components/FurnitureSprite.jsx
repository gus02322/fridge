// ─────────────────────────────────────────────────────────────
//  <FurnitureSprite type=... /> — point d'entrée UNIQUE pour le visuel d'un
//  meuble (frigo, placard sec, étagère à épices).
//
//  Rendu actuel : SVG "matte 3D" — volumes arrondis, une source de lumière
//  douce venant du HAUT-DROITE, ombres de contact (occlusion) sous l'objet,
//  palette neutre et raffinée avec une couleur d'accent discrète par meuble.
//
//  Pour brancher de vraies illustrations 3D pré-rendues plus tard : remplir
//  SPRITE_SOURCES[type] avec une URL d'image — le reste de l'app ne bouge pas.
// ─────────────────────────────────────────────────────────────

const SPRITE_SOURCES = {
  // fridge: '/sprites/iso/fridge.png', placards: '…', epices: '…'
}

// Palette matte par meuble. Corps neutre + un accent subtil.
const PALETTE = {
  fridge: {
    light: '#ffffff',
    body: '#eceae6',
    shade: '#d3cfc8',
    accent: '#8ea6bd', // bleu-gris doux
    accentLo: '#728aa2',
  },
  placards: {
    light: '#e7d3b0',
    body: '#d3b482',
    shade: '#b28a54',
    accent: '#9c7038', // bois chaud
    accentLo: '#7e5629',
  },
  epices: {
    light: '#f3ece2',
    body: '#e4d8c8',
    shade: '#c8b39a',
    accent: '#c07f5f', // terracotta doux
    accentLo: '#a5654a',
  },
}

// Frigo & placard : une "armoire" arrondie avec volume (léger côté visible).
function Cabinet({ id, p, doors = 'stacked' }) {
  const gBody = `body-${id}`
  const gSide = `side-${id}`
  const gTop = `top-${id}`
  const gHandle = `hdl-${id}`
  const gAO = `ao-${id}`
  const gGloss = `gloss-${id}`
  return (
    <svg viewBox="0 0 140 200" preserveAspectRatio="xMidYMax meet" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        {/* face avant : lumière en haut-droite */}
        <linearGradient id={gBody} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.55" stopColor={p.body} />
          <stop offset="1" stopColor={p.shade} />
        </linearGradient>
        {/* côté droit (dans l'ombre légère) */}
        <linearGradient id={gSide} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={p.shade} />
          <stop offset="1" stopColor={p.accentLo} stopOpacity="0.35" />
        </linearGradient>
        {/* dessus */}
        <linearGradient id={gTop} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="1" stopColor={p.body} />
        </linearGradient>
        <linearGradient id={gHandle} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.accent} />
          <stop offset="1" stopColor={p.accentLo} />
        </linearGradient>
        <radialGradient id={gGloss} cx="0.72" cy="0.16" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gAO} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3a2f24" stopOpacity="0.32" />
          <stop offset="1" stopColor="#3a2f24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ombre de contact au sol (occlusion), décalée vers la gauche */}
      <ellipse cx="60" cy="190" rx="52" ry="10" fill={`url(#${gAO})`} />

      {/* petit côté droit visible → volume */}
      <path d="M112 26 q10 2 10 14 v138 q0 10 -10 12 z" fill={`url(#${gSide})`} />
      {/* dessus */}
      <path d="M24 24 q6 -12 20 -12 h56 q14 0 22 12 q-8 -4 -22 -4 h-56 q-14 0 -20 4 z" fill={`url(#${gTop})`} />

      {/* corps */}
      <rect x="20" y="16" width="94" height="172" rx="22" fill={`url(#${gBody})`} />
      {/* highlight matte doux */}
      <rect x="20" y="16" width="94" height="172" rx="22" fill={`url(#${gGloss})`} />
      {/* liseré lumineux en haut-droite */}
      <rect x="20" y="16" width="94" height="172" rx="22" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />

      {doors === 'stacked' ? (
        <>
          {/* joint horizontal (2 portes) */}
          <line x1="26" y1="80" x2="108" y2="80" stroke={p.shade} strokeWidth="2.2" strokeOpacity="0.7" />
          <line x1="26" y1="78.4" x2="108" y2="78.4" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
          {/* poignées verticales (accent) */}
          <rect x="97" y="40" width="6" height="30" rx="3" fill={`url(#${gHandle})`} />
          <rect x="97" y="92" width="6" height="78" rx="3" fill={`url(#${gHandle})`} />
        </>
      ) : (
        <>
          {/* joint vertical (2 portes côte à côte) */}
          <line x1="67" y1="26" x2="67" y2="178" stroke={p.shade} strokeWidth="2.2" strokeOpacity="0.7" />
          <line x1="68.6" y1="26" x2="68.6" y2="178" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
          {/* boutons ronds (accent) */}
          <circle cx="58" cy="104" r="5" fill={`url(#${gHandle})`} />
          <circle cx="77" cy="104" r="5" fill={`url(#${gHandle})`} />
        </>
      )}
    </svg>
  )
}

// Étagère à épices : montée au mur, 2 tablettes + petits pots.
function SpiceShelf({ id, p }) {
  const gPlank = `plk-${id}`
  const gDrop = `drp-${id}`
  const jars = [
    { x: 20, c: p.accent },
    { x: 44, c: '#b8977a' },
    { x: 68, c: p.accentLo },
    { x: 92, c: '#cf9d78' },
  ]
  return (
    <svg viewBox="0 0 130 110" preserveAspectRatio="xMidYMin meet" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={gPlank} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="1" stopColor={p.shade} />
        </linearGradient>
        <radialGradient id={gDrop} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3a2f24" stopOpacity="0.18" />
          <stop offset="1" stopColor="#3a2f24" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ombres portées douces des tablettes sur le mur */}
      <ellipse cx="66" cy="52" rx="58" ry="6" fill={`url(#${gDrop})`} />
      <ellipse cx="66" cy="100" rx="58" ry="6" fill={`url(#${gDrop})`} />

      {[10, 58].map((ty, row) => (
        <g key={row}>
          {/* pots posés sur la tablette */}
          {jars.map((j, i) => (
            <g key={i}>
              <rect x={j.x} y={ty + 6} width="16" height="28" rx="5" fill={j.c} />
              <rect x={j.x} y={ty + 6} width="16" height="28" rx="5" fill="#ffffff" fillOpacity="0.14" />
              <rect x={j.x + 1} y={ty + 2} width="14" height="7" rx="3" fill="#efe7db" />
            </g>
          ))}
          {/* tablette (planche) */}
          <rect x="6" y={ty + 34} width="118" height="9" rx="4.5" fill={`url(#${gPlank})`} />
          <rect x="6" y={ty + 34} width="118" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.5" />
          {/* équerres */}
          <rect x="14" y={ty + 43} width="5" height="9" rx="2" fill={p.shade} />
          <rect x="111" y={ty + 43} width="5" height="9" rx="2" fill={p.shade} />
        </g>
      ))}
    </svg>
  )
}

export default function FurnitureSprite({ type = 'fridge', kind, className = '', style }) {
  const t = type || kind || 'fridge'
  const p = PALETTE[t] ?? PALETTE.fridge
  const sprite = SPRITE_SOURCES[t]

  if (sprite) {
    return <img src={sprite} alt="" className={`h-full w-full object-contain ${className}`} style={style} />
  }

  return (
    <div className={className} style={style}>
      {t === 'epices' ? (
        <SpiceShelf id={t} p={p} />
      ) : (
        <Cabinet id={t} p={p} doors={t === 'placards' ? 'side' : 'stacked'} />
      )}
    </div>
  )
}
