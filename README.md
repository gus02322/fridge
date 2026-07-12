# Frigo virtuel 🧊 — App complète (4 / 4)

Un frigo virtuel gamifié pour cuisiner. Inventaire → menu (recettes locales) →
planning & cuisine → **nutrition & score**.
React + Vite + Tailwind, état React + `localStorage`, pas de backend applicatif.

## Lancer

```bash
npm install
npm run dev
```

Aucune clé, aucun backend, aucun appel réseau : les recettes sont lues depuis
un fichier local **`src/data/recipes.json`** livré avec le projet. L'app tourne
entièrement côté client (parfait pour un hébergement statique type GitHub
Pages).

## Ce que contient l'étape 1

- **3 zones** d'inventaire : Frigo, Placard sec, Épices.
- **Ajout façon petit jeu** : catégorie → item → quantité, avec feedback
  « collecté » satisfaisant (anneau qui éclate, `+n` qui flotte, petit son,
  compteur qui monte).
- Items **`tracké`** : la quantité compte (stepper `+ / −` ou niveau
  peu/moyen/beaucoup). Items **`staple`** : présence seule (toggle
  « j'en ai / j'en ai plus »).
- **Persistance** `localStorage`.

## Ce que contient l'étape 2 — recettes locales

- Onglet **Cuisine** : bouton « Générer le menu » qui **matche les recettes du
  fichier local** `src/data/recipes.json` avec le frigo. Aucun réseau.
- **Matching à 3 niveaux**, calculé côté client à partir du nombre
  d'ingrédients manquants (un ingrédient est « présent » s'il figure dans le
  frigo, matching par nom sans accents) :
  `cuisinable` (0 manquant), `presque` (1 manquant), `ambitieuse` (2+).
- **Recettes triées** par niveau (cuisinable en haut) avec un état de
  déblocage visuel type jeu : prêt 🍳 / à un pas 🔓 / verrouillé 🔒.
- **Liste de courses déduite** : agrège les ingrédients manquants et indique,
  pour chacun, combien de plats il débloque (« Achète Huile d'olive →
  débloque 3 plats »), triée par plats débloqués.
- Dernier menu persisté dans `localStorage`.

### Ajouter / remplacer les recettes

Tout vit dans **`src/data/recipes.json`** — un simple tableau JSON. Colle
autant de recettes que tu veux en respectant ce format :

```json
{
  "titre": "Omelette aux champignons",
  "temps_min": 12,
  "portions_base": 2,
  "calories": 290, "proteines": 20, "lipides": 22, "glucides": 4,
  "etapes": ["Étape 1…", "Étape 2…"],
  "ingredients": [
    { "nom": "Œufs", "quantite": 4, "unite": "pièce" },
    { "nom": "Beurre", "quantite": null, "unite": "" }
  ]
}
```

- **Pas de champ `present`** : la présence est calculée en direct depuis le
  frigo. Le `nom` d'un ingrédient doit correspondre au nom de l'item du frigo
  (voir `src/data/catalog.js` : `Œufs`, `Champignons`, `Pâtes`, `Ail`,
  `Huile d'olive`, `Sel`… — accents et casse ignorés au matching).
- `quantite: null` (ou `unite: ""`) pour les basiques (sel, huile, ail…) :
  affichés sans quantité et non mis à l'échelle par convive.
- Nutrition (`calories`, `proteines`, `lipides`, `glucides`) par portion,
  optionnelle.

Fichiers clés : `src/data/recipes.json` (les recettes),
`src/utils/menu.js` (matching frigo, tri, liste de courses),
`src/components/{MenuView,RecipeCard,ShoppingList}.jsx`.

## Ce que contient l'étape 3

- **Paramètres de filtrage** appliqués au matching : curseur de **temps de
  prépa max** (minutes) et **mode express** (« ⚡ J'ai 20 min ») qui ne garde
  que les recettes `temps_min <= 20` et de niveau `cuisinable`.
- **Planning hebdo** (onglet Semaine) : 7 jours, 2 repas/jour, avec un
  nombre de **convives réglable par repas**. Modèle
  `Jour : { date, jour, repas:[{ type:"dej"|"diner", convives, recette?, cuisine? }] }`.
- **Calendrier** : chaque repas affiche le plat assigné et ses quantités
  **mises à l'échelle** selon les convives (`convives / portions_base`).
- **Boucle « J'ai cuisiné »** : décrémente automatiquement du frigo les
  ingrédients **trackés** consommés (les **staples** ne bougent pas), avec
  un petit feedback de jeu (burst + son). Le stock diminue dans l'onglet Frigo.

Fichiers clés étape 3 : `src/utils/planning.js` (semaine, mise à l'échelle,
consommation), `src/components/WeekView.jsx`.

## Ce que contient l'étape 4 — nutrition & score

- **Profil utilisateur** (onglet Profil) `{ sexe, age, poids, taille, activite }`
  avec `activite = "sedentaire" | "actif" | "sportif"`. Besoin calorique
  quotidien calculé par **Mifflin-St Jeor** et **stocké** dans le profil.
- **Valeur nutritionnelle des recettes** : chaque recette de `recipes.json`
  porte `{ calories, proteines, lipides, glucides }` par portion. Affichés sur
  chaque recette.
- **Couverture** : sur le planning, chaque repas indique
  « ce repas couvre ~X% de ton besoin » (+ total par journée). Indicatif.
- **Système de points ludique et de RÉCOMPENSE** : note l'**équilibre** et la
  **variété** d'un repas / d'une journée / du frigo (jamais les aliments un
  par un). Un repas légumes + protéines + bons lipides marque haut ; un frigo
  mono-catégorie marque peu. Aucun message culpabilisant. Feedback de jeu
  (« +N » qui monte, pop du badge) quand le score augmente.
- **Mention discrète** : « estimations ludiques, pas un conseil médical ni un
  régime ».

Fichiers clés étape 4 : `src/utils/nutrition.js` (Mifflin-St Jeor, couverture),
`src/utils/score.js` (équilibre/variété, récompense),
`src/components/{ProfileView,ScoreBadge,Macros}.jsx`.

## Modèle de données (réutilisé sur les 4 étapes)

```
Item : { id, nom, categorie, zone, type, quantite, unite, peremption?, present? }
  zone  : "frigo" | "sec" | "epices"
  type  : "tracke" (quantité) | "staple" (présence booléenne `present`)
  unite : "pièce" | "portion" | "paquet" | "niveau"   // jamais de grammes
```

Le catalogue (catégories + items) vit dans `src/data/catalog.js`.

## Sprites

Tout le visuel d'un item passe par **un seul composant** :
`src/components/ItemSprite.jsx` (emoji + tuile colorée par catégorie
pour l'instant). Les sprites isométriques par catégorie se brancheront
ici via `SPRITE_SOURCES`, sans toucher au reste de l'app.
