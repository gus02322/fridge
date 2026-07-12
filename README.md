# Frigo virtuel 🧊 — App complète (4 / 4)

Un frigo virtuel gamifié pour cuisiner. Inventaire → menu (recettes locales) →
planning & cuisine → **nutrition & score**.
React + Vite + Tailwind, état React + `localStorage`, pas de backend applicatif.

## Lancer

```bash
npm install
npm run dev
```

## Comptes & stockage cloud (Firebase)

L'app exige une **connexion** (e-mail + mot de passe via Firebase Auth). Les
données de chaque utilisateur (frigo, placards, épices, planning, profil, menu)
sont stockées dans **Cloud Firestore**, dans un unique document `users/{uid}` —
chacun ne voit que ses propres données. Un `useCloudState(clé, défaut)`
(`src/data/CloudStore.jsx`) remplace l'ancien `useLocalStorage` avec la même
API, et migre automatiquement les données locales existantes au premier login.

La config web Firebase (`src/firebase.js`) est un identifiant **public** ; la
sécurité vient des règles Firestore (`firestore.rules`).

**À faire une fois dans la console Firebase** (voir aussi le résumé pas-à-pas
fourni séparément) :
1. **Authentication → Sign-in method** : activer **E-mail/Mot de passe**.
2. **Authentication → Settings → Authorized domains** : ajouter
   `gus02322.github.io`.
3. **Firestore Database → Create database**.
4. **Firestore → Rules** : coller le contenu de `firestore.rules` et publier.

Les recettes, elles, restent locales (**`src/data/recipes.json`**) : le front
est un site statique (GitHub Pages) et Firebase fournit l'auth + la base.

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

Tout vit dans **`src/data/recipes.json`** : un objet `{ "recipes": [ … ] }`.
Colle autant de recettes que tu veux dans le tableau, au format :

```json
{
  "recipes": [
    {
      "id": "r001",
      "titre": "Omelette nature",
      "ingredients": [
        { "nom": "œufs", "quantite": 3, "unite": "pièce" },
        { "nom": "beurre", "quantite": 1, "unite": "peu" }
      ],
      "etapes": ["Battre les œufs…", "Cuire dans le beurre…"],
      "temps_min": 10,
      "portions_base": 1,
      "nutrition": { "calories": 300, "lipides": 24, "proteines": 19, "glucides": 2 }
    }
  ]
}
```

- **Pas de champ `present`** : la présence est calculée en direct depuis le
  frigo. Le matching est **tolérant** — accents, casse, **pluriel** et **noms
  composés** : `tomates` ↔ `Tomate`, `fromage râpé` ↔ `Fromage`,
  `escalope de poulet` ↔ `Poulet`. Un ingrédient absent du frigo (ou qui n'a
  pas d'item correspondant, ex. `lardons`, `chapelure`) compte comme manquant.
- `nutrition` (`calories`, `proteines`, `lipides`, `glucides`) par portion,
  optionnelle. Un format à plat (`"calories": 300` sur la recette) est aussi
  accepté.
- `id` optionnel (sinon un id est dérivé du titre). `unite` accepte les unités
  ludiques : `pièce`, `portion`, `paquet`, ou un niveau `peu`/`moyen`/`beaucoup`.

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
