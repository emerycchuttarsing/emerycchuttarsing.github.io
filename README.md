# Emeryc Chuttarsing — Portfolio

Portfolio en anglais consacré à la finance quantitative, au machine learning et
à l'ingénierie. Le développement suit [cinq jalons](docs/MILESTONES.md), avec un
commit à chaque point de contrôle. Les jalons 1 à 3 sont réalisés : fondations, direction visuelle, scène 3D et
études de cas structurées avec parcours et contact.

## Démarrer localement

Prérequis : Node **24.15.0** (voir `.nvmrc`) et npm **11.x**.

```bash
# Depuis ce dépôt ; nvm use est facultatif si la bonne version est déjà active.
nvm use
npm ci
npm run dev
```

Le serveur affiche son URL, normalement `http://127.0.0.1:4321/`.

| Commande              | Fonction                                                             |
| --------------------- | -------------------------------------------------------------------- |
| `npm run dev`         | Développement avec rechargement                                      |
| `npm run check`       | Validation Astro et TypeScript                                       |
| `npm run build`       | Génération statique dans `dist/`                                     |
| `npm run check:build` | Vérification des pages, liens, ancres et ressources locales du build |
| `npm run preview`     | Aperçu du dernier build                                              |
| `npm run format`      | Formatage des fichiers de développement                              |
| `npm run verify`      | Formatage, types, build et contrôle de la sortie                     |

Les documents REA historiques sont exclus du formatage automatique afin de
préserver leur contenu d'origine.

## Pages disponibles

- `/` : présentation et accès aux sept projets.
- `/projects/` : index des projets.
- `/projects/<id>/` : sept études avec textes provisoires.
- `/about/` : biographie, expériences, formations, compétences et contact.
- `/404.html` : page d'erreur.

Les études en anglais restent provisoires : trois versions développées et quatre
versions courtes, sans résultats chiffrés. Les posters sont des illustrations
conceptuelles. Le CV fourni, son téléchargement et les coordonnées sont intégrés. L’accueil combine un terrain de points et sept panneaux dans une scène 3D.
Les transitions animées, la sélection et les vidéos relèvent du jalon 4.

## Modifier les contenus

| Élément                                                 | Source                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Biographie, parcours, compétences et coordonnées        | `src/data/site.ts`                                                              |
| Résumé, contexte, rôle, contributions, méthode et étude | `src/content/projects/<id>.md`                                                  |
| Champs autorisés et validation                          | `src/content.config.ts` et `src/lib/projects.ts`                                |
| Posters et futures vidéos                               | `public/media/`, puis référence dans le frontmatter                             |
| CV téléchargeable                                       | `public/resume/emeryc-chuttarsing-resume.pdf` ; chemin dans `site.links.resume` |
| Couleurs, polices, espacements                          | `src/styles/tokens.css`                                                         |
| Réglages caméra, terrain, panneaux et éclairage         | `src/scene/config.ts`                                                           |

Un identifiant correspond au nom du fichier Markdown : le changer modifie l'URL.
Les champs de lien absents sont omis dans l'interface. Les chemins de médias sont
relatifs à la racine du site, par exemple `/media/project-placeholder.svg`.
Ne placer dans `public/` que des fichiers à rendre accessibles aux visiteurs.

Chaque fiche renseigne `context`, `role`, `contributions`, trois étapes `workflow`
(titre et description), et `poster.caption`. `summary` et `technologies` alimentent
à la fois l’index et l’étude. Les liens `links.code`, `links.report` et `links.demo`
sont facultatifs : seules les destinations renseignées apparaissent. Le sommaire
reprend automatiquement les titres Markdown `##`, avec une entrée pour le schéma
de méthode. Éviter les identifiants réservés `method-overview` et `contributions-title`.

Voir le [guide des contenus et des sources](docs/CONTENT_SOURCES.md) pour remplacer
les textes, figures, ressources et informations de parcours. Le statut
`editorialStatus: draft` conserve la mention discrète de contenu provisoire.

## Validation visuelle et navigateur

Les recettes des [jalons 2](docs/validation/jalon-2/README.md) et
[3](docs/validation/jalon-3/README.md) contiennent les captures et résultats. La galerie montre les sept projets ensemble sur grand écran ;
sous 1100 px de largeur ou 800 px de hauteur, elle utilise des posters HTML.
Les quatre tailles contrôlées sont 1440 × 900, 1280 × 800, 768 × 1024 et 390 × 844.

Le contrôle complémentaire `scripts/check-browser.mjs` nécessite Chrome et un
module Playwright dans l’outillage de test (distinct des dépendances du site).
Lancer l’aperçu du build, puis :

```bash
# Si Playwright est déjà disponible dans node_modules :
node scripts/check-browser.mjs

# Sinon, indiquer l’entrée ESM de l’installation Playwright de l’outillage :
PLAYWRIGHT_MODULE=/chemin/vers/playwright/index.mjs node scripts/check-browser.mjs
```

`PORTFOLIO_BASE_URL` peut remplacer l’URL locale et `PORTFOLIO_SCREENSHOTS` le
répertoire de sortie, par défaut `test-results/jalon-2` (ignoré par Git).
Ce contrôle couvre cadrage, débordements, navigation clavier, rechargement et
retour pour les sept études, replis sans JavaScript/WebGL, mouvement réduit,
perte du contexte, redimensionnement et absence de rendus continus au repos.
Il complète `npm run verify`, qui reste le contrôle de CI sans navigateur.

Le contrôle des contenus utilise le même outillage :

```bash
PLAYWRIGHT_MODULE=/chemin/vers/playwright/index.mjs node scripts/check-content-browser.mjs
```

Sa sortie est `test-results/jalon-3` par défaut. Il vérifie les neuf pages éditoriales
aux quatre dimensions, les sommaires, les parcours précédent/suivant, le clavier,
les études sans JavaScript, le téléchargement du CV et la galerie à 1440 × 900.
Il ne lance aucun entraînement et ne contacte pas les destinataires des liens.

## Publication GitHub Pages

La cible est `https://emerycchuttarsing.github.io/` et la base est `/`.
La CI valide les pushes sur `main`, `codex/**` et les pull requests vers `main`.

Pour la livraison finale :

1. Intégrer la version validée dans `main` et pousser le dépôt.
2. Dans GitHub, sélectionner **Settings → Pages → Source → GitHub Actions**.
3. Depuis **Actions → Publish portfolio**, lancer manuellement le workflow sur `main`.
4. Vérifier l'accueil, une étude ouverte directement, la page 404 et les médias à l'URL publique.

Le workflow valide puis publie uniquement `dist/`. Les modifications locales et
les commits de jalon ne déclenchent pas une publication. Aucun déploiement distant
n’a été effectué pendant les jalons 1 à 3.

## Préparation conservée

- [Brief de passation pour la construction](docs/BRIEF_AGENT_CODEUR.md)
- [Architecture actuelle](docs/ARCHITECTURE.md)
- [Cinq jalons et vérifications](docs/MILESTONES.md)
- [Brief de positionnement](docs/BRIEF.md)
- [Synthèse Ing Tian × Mirage](docs/DESIGN_SYNTHESIS_ING_MIRAGE.md)
- [Feuille de route préparatoire](docs/ROADMAP.md)
- [Passation REA et études](docs/REA_HANDOFF.md)
