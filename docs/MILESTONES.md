# Exécution du portfolio en cinq jalons

Le découpage demandé par Emeryc remplace l'ordre d'exécution proposé dans les
anciens documents. Le [brief de passation](BRIEF_AGENT_CODEUR.md) reste la référence
pour les fonctionnalités et le mélange Ing Tian × Mirage.

| Jalon | Périmètre                                                          | État    |
| ----- | ------------------------------------------------------------------ | ------- |
| 1     | Structure du projet, dépendances, données, routes et vérifications | Terminé |
| 2     | Mise en page et squelette visuel, composition Ing Tian × Mirage    | À venir |
| 3     | Composants de contenu principaux, panneaux et études de cas        | À venir |
| 4     | Interactivité, états de scène et connexions API si nécessaires     | À venir |
| 5     | Responsive design, finitions CSS et recette finale                 | À venir |

Un commit local marque chaque jalon terminé. La branche de construction est
`codex/portfolio`. La publication GitHub Pages est préparée, avec un déclenchement
manuel depuis `main` lors de la livraison finale.

## Jalon 1 — critères de sortie

- Installation reproductible avec `npm ci` et versions exactes dans le lockfile.
- Vérification Astro/TypeScript et formatage réussis.
- Sept fiches issues du brief, avec trois projets phares dans le bon ordre.
- Une collection commune pour l'accueil, l'index, les études et la future scène.
- Onze pages HTML générées, ouverture directe et navigation interne fonctionnelles.
- Contrat de scène et réglages initiaux séparés des textes.
- Documentation locale, CI de validation et workflow de publication préparés.

Commit prévu : `chore: complete milestone 1 project foundation`.

## Vérifications réalisées

Vérifications du 13 octobre 2026, sur le Mac local :

- `npm ci` : installation du lockfile réussie sous Node 24.15.0 / npm 11.12.1.
- Dépendances principales : Astro 7.3.8, Three.js 0.186.1, TypeScript 6.0.3.
  TypeScript 6 respecte la plage de compatibilité de `@astrojs/check` 0.9.10.
- `npm run verify` : formatage conforme ; 17 fichiers vérifiés, zéro erreur,
  avertissement ou indication de dépréciation ; build réussi.
- Sortie : onze pages HTML, sept routes projet, 109 références internes vérifiées.
  Le contrôleur a détecté puis permis de corriger une URL canonique incorrecte
  sur la 404.
- HTTP local : les onze fichiers de page sont accessibles ; une URL inconnue
  renvoie HTTP 404 avec le contenu personnalisé ; favicon et poster accessibles.
- Navigateur intégré : accueil et index inspectés ; ouverture du capstone,
  rechargement de son URL et retour navigateur vérifiés.
- Les trois projets phares restent les trois premiers ; les sept projets sont
  accessibles sur l'accueil et l'index.

L'aperçu local est lancé avec `npm run preview -- --port 4321`.
La CI et le workflow Pages sont préparés ; ils n'ont pas encore été exécutés
sur GitHub. Les essais de la scène, du responsive final et des autres navigateurs
appartiennent aux prochains jalons.

Les textes sont provisoires et ne contiennent pas de revendications chiffrées.
Le moteur 3D n'est pas encore implémenté : ses types, sa configuration et son
contrat de cycle de vie sont prêts pour la suite.
