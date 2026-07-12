// Traitement des recettes LOCALES (src/data/recipes.json) : matching avec le
// frigo, normalisation, tri par niveau de déblocage, et déduction de la liste
// de courses. Plus aucun appel réseau : tout est calculé côté client.

import { normNom, nomsMatch } from './planning'

// État de déblocage façon jeu, par niveau.
export const NIVEAU_META = {
  cuisinable: { rang: 0, label: 'Prêt', emoji: '🍳', tint: 'emerald' },
  presque: { rang: 1, label: 'À un pas', emoji: '🔓', tint: 'amber' },
  ambitieuse: { rang: 2, label: 'Verrouillé', emoji: '🔒', tint: 'slate' },
}

const num = (v) => (Number.isFinite(+v) && v != null && v !== '' ? Math.round(+v) : null)

// Accepte soit un tableau, soit un objet { recipes: [...] } (format du
// fichier livré), et renvoie toujours le tableau de recettes.
function toArray(recipes) {
  if (Array.isArray(recipes)) return recipes
  if (Array.isArray(recipes?.recipes)) return recipes.recipes
  if (Array.isArray(recipes?.recettes)) return recipes.recettes
  return []
}

// Noms des items réellement DISPONIBLES dans le frigo (pour le matching).
//  - staple : présent tant que `present` n'est pas explicitement false.
//  - tracké : présent si la quantité est > 0.
export function fridgeNames(items) {
  return (items || [])
    .filter((it) => (it.type === 'staple' ? it.present !== false : (it.quantite ?? 0) > 0))
    .map((it) => it.nom)
}

// Normalise une recette brute et CALCULE son niveau à partir des ingrédients
// présents dans le frigo. `isPresent(nom)` teste un ingrédient contre le frigo
// (matching tolérant : accents, pluriel, noms composés). Le niveau dépend du
// nombre de manquants : 0 -> cuisinable · 1 -> presque · 2+ -> ambitieuse.
export function normalizeRecette(r, index, isPresent = () => false) {
  const ingredients = (Array.isArray(r?.ingredients) ? r.ingredients : [])
    .map((i) => ({
      nom: String(i?.nom ?? '').trim(),
      quantite: i?.quantite ?? null,
      unite: String(i?.unite ?? '').trim(),
      present: isPresent(i?.nom),
    }))
    .filter((i) => i.nom)

  const manquants = ingredients.filter((i) => !i.present).length
  const niveau =
    manquants === 0 ? 'cuisinable' : manquants === 1 ? 'presque' : 'ambitieuse'

  // Nutrition : soit imbriquée { nutrition: {...} }, soit à plat sur la recette.
  const n = r?.nutrition ?? r ?? {}

  return {
    id: r?.id ? String(r.id) : `${index}-${String(r?.titre ?? '').slice(0, 24)}`,
    titre: String(r?.titre ?? 'Recette sans nom').trim(),
    niveau,
    manquants,
    ingredients,
    etapes: (Array.isArray(r?.etapes) ? r.etapes : []).map(String).filter(Boolean),
    temps_min: Number.isFinite(+r?.temps_min) ? +r.temps_min : null,
    portions_base: Number.isFinite(+r?.portions_base) ? +r.portions_base : null,
    // Nutrition estimée par portion. Null si absent.
    calories: num(n.calories),
    proteines: num(n.proteines),
    lipides: num(n.lipides),
    glucides: num(n.glucides),
  }
}

// Matche le catalogue de recettes local avec le frigo, puis trie :
// cuisinable en haut, puis presque, puis ambitieuse (et à niveau égal, le
// moins de manquants et le plus rapide en premier).
export function matchMenu(recipes, items) {
  const dispo = fridgeNames(items)
  const isPresent = (nom) => dispo.some((f) => nomsMatch(nom, f))
  return toArray(recipes)
    .map((r, i) => normalizeRecette(r, i, isPresent))
    .filter((r) => r.ingredients.length > 0)
    .sort(
      (a, b) =>
        NIVEAU_META[a.niveau].rang - NIVEAU_META[b.niveau].rang ||
        a.manquants - b.manquants ||
        (a.temps_min ?? 999) - (b.temps_min ?? 999),
    )
}

// Liste de courses : agrège tous les ingrédients manquants et compte,
// pour chacun, combien de plats il débloque. Trié par plats débloqués.
export function buildListeCourses(recettes) {
  const map = new Map()
  for (const r of recettes) {
    for (const ing of r.ingredients) {
      if (ing.present) continue
      const key = normNom(ing.nom)
      if (!map.has(key)) {
        map.set(key, { nom: ing.nom, unite: ing.unite, plats: [] })
      }
      map.get(key).plats.push(r.titre)
    }
  }
  return [...map.values()]
    .map((e) => ({ ...e, count: e.plats.length }))
    .sort((a, b) => b.count - a.count || a.nom.localeCompare(b.nom))
}
