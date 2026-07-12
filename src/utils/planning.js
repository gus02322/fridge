// Planning hebdo + mise à l'échelle des recettes selon les convives,
// et logique de consommation du frigo ("j'ai cuisiné").

export const JOURS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]

// Modèle repas : { type:"dej"|"diner", convives:int, recette?, cuisine?:bool }
export const REPAS = [
  { type: 'dej', label: 'Déjeuner', emoji: '☀️' },
  { type: 'diner', label: 'Dîner', emoji: '🌙' },
]

// Semaine courante (lundi → dimanche). Jour : { date, jour, repas:[...] }
export function initWeek(base = new Date()) {
  const day = base.getDay() // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(base)
  monday.setDate(base.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  return JOURS.map((jour, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      date: d.toISOString().slice(0, 10),
      jour,
      repas: REPAS.map((r) => ({
        type: r.type,
        convives: 2,
        recette: null,
        cuisine: false,
      })),
    }
  })
}

export function formatShort(dateISO) {
  const [, m, d] = dateISO.split('-')
  return `${d}/${m}`
}

// Normalisation de nom pour matcher ingrédient IA ↔ item du frigo.
export function normNom(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .trim()
}

// Mots vides ignorés au découpage en tokens (français courant).
const MOTS_VIDES = new Set(['de', 'du', 'des', 'a', 'au', 'aux', 'la', 'le', 'les', 'l', 'd', 'et', 'en', 'ou'])

// Passe un mot au singulier de façon prudente (pluriels français simples).
function singulier(mot) {
  return mot.length > 3 ? mot.replace(/[sx]$/, '') : mot
}

// Découpe un nom en tokens significatifs, sans accents, au singulier.
// « Escalope de poulet » -> ['escalope', 'poulet'] ; « tomates » -> ['tomate'].
function tokens(s) {
  return normNom(s)
    .split(/[^a-z0-9œ]+/i)
    .filter((t) => t && !MOTS_VIDES.has(t))
    .map(singulier)
}

// Un ingrédient de recette correspond-il à un item du frigo ? Tolérant aux
// accents, au pluriel et aux noms composés : « tomates » ↔ « Tomate »,
// « fromage râpé » ↔ « Fromage », « escalope de poulet » ↔ « Poulet ».
// Règle : égalité normalisée, OU tous les tokens de l'un sont contenus dans
// ceux de l'autre (le nom court doit apparaître en entier dans le long).
export function nomsMatch(a, b) {
  const na = normNom(a)
  const nb = normNom(b)
  if (!na || !nb) return false
  if (na === nb) return true
  const ta = tokens(a)
  const tb = tokens(b)
  if (ta.length === 0 || tb.length === 0) return false
  const setA = new Set(ta)
  const setB = new Set(tb)
  const bDansA = tb.every((t) => setA.has(t))
  const aDansB = ta.every((t) => setB.has(t))
  return bDansA || aDansB
}

// Facteur d'échelle : convives / portions de base de la recette.
export function facteur(recette, convives) {
  const base =
    recette?.portions_base && recette.portions_base > 0
      ? recette.portions_base
      : 2
  return convives / base
}

// Met une recette à l'échelle d'un nombre de convives (unités ludiques).
export function scaleRecette(recette, convives) {
  const f = facteur(recette, convives)
  return {
    ...recette,
    portions: convives,
    ingredients: recette.ingredients.map((ing) =>
      ing.quantite == null
        ? { ...ing } // niveau (peu/moyen/beaucoup) : pas de calcul numérique
        : { ...ing, quantite: Math.max(1, Math.round(ing.quantite * f)) },
    ),
  }
}
