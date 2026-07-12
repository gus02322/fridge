import { useMemo, useState } from 'react'
import { ZONES } from '../data/catalog'
import { scoreFridge } from '../utils/score'
import KitchenScene from './KitchenScene'
import StorageView from './StorageView'
import AddItemFlow from './AddItemFlow'
import ScoreBadge from './ScoreBadge'

// Vue "cuisine" : une scène illustrée où l'on tape un meuble pour l'ouvrir.
// La logique d'inventaire (items par zone, ajout, contrôles) est inchangée —
// c'est une refonte visuelle et de navigation.
export default function InventoryView({ items, actions, collect, muted }) {
  const [openZone, setOpenZone] = useState(null) // null = scène ; sinon id de zone
  const [addingZone, setAddingZone] = useState(null) // zone en cours d'ajout (ou undefined)

  const byZone = useMemo(() => {
    const map = { frigo: [], sec: [], epices: [] }
    items.forEach((it) => map[it.zone]?.push(it))
    return map
  }, [items])

  const counts = useMemo(
    () => ({ frigo: byZone.frigo.length, sec: byZone.sec.length, epices: byZone.epices.length }),
    [byZone],
  )

  const score = useMemo(() => scoreFridge(items), [items])
  const zone = ZONES.find((z) => z.id === openZone)

  return (
    <>
      {/* Score d'équilibre du frigo (récompense la variété) */}
      <div className="mx-auto mb-3 flex max-w-3xl items-center gap-2 rounded-2xl border-2 border-white bg-white/70 p-2.5 shadow-tile">
        <span className="font-display text-xs font-800 uppercase tracking-wide text-slate-400">
          Équilibre du frigo
        </span>
        <span className="ml-auto">
          <ScoreBadge score={score} size="sm" />
        </span>
      </div>

      {zone ? (
        <StorageView
          zone={zone}
          items={byZone[zone.id]}
          actions={actions}
          onBack={() => setOpenZone(null)}
          onAdd={() => setAddingZone(zone.id)}
        />
      ) : (
        <KitchenScene zones={ZONES} counts={counts} onOpen={setOpenZone} />
      )}

      {addingZone !== null && (
        <AddItemFlow
          muted={muted}
          zone={addingZone}
          onClose={() => setAddingZone(null)}
          onCollect={collect}
        />
      )}
    </>
  )
}
