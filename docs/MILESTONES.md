# Exécution du portfolio en cinq jalons

Le découpage demandé par Emeryc remplace l'ordre d'exécution proposé dans les
anciens documents. Le [brief de passation](BRIEF_AGENT_CODEUR.md) reste la référence
pour les fonctionnalités et le mélange Ing Tian × Mirage.

| Jalon | Périmètre                                                          | État    |
| ----- | ------------------------------------------------------------------ | ------- |
| 1     | Structure du projet, dépendances, données, routes et vérifications | Terminé |
| 2     | Mise en page et squelette visuel, composition Ing Tian × Mirage    | Terminé |
| 3     | Composants de contenu principaux, études de cas et About           | Terminé |
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

## Vérifications du jalon 1

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
À ce point de contrôle, seuls les types, la configuration et le contrat du moteur
3D étaient présents ; son implémentation arrive au jalon 2.

## Jalon 2 — réalisé

- Composition ivoire/graphite, nom ample, navigation en capsule et terrain 3D.
- Sept panneaux éclairés dans la scène commune, trois phares et quatre secondaires.
- Sept posters SVG distincts, illustratifs et remplaçables depuis les fiches.
- Identité appliquée à l’index, aux sept études, à About et à la 404.
- Replis HTML, clavier, mouvement réduit et cycle de vie vérifiés.
- `npm run verify` réussi : 25 fichiers, zéro erreur/avertissement/indication
  dans Astro Check ; onze pages et 152 références internes validées.
- Recette Chrome : les quatre dimensions prévues, les sept parcours aller/retour,
  absence de boucle permanente et un seul canvas après navigation répétée.

Commit de contrôle : `feat: complete milestone 2 visual layout`.
Les captures, mesures et limites sont dans [la recette du jalon 2](validation/jalon-2/README.md).

Les animations de transition, les aperçus sélectionnés et les vidéos seront
implémentés au jalon 4 ; les finitions responsive et performances au jalon 5.

## Jalon 3 — réalisé

- Dix composants éditoriaux et de profil réutilisables, sans JavaScript requis.
- Sept études provisoires : trois textes de 674 à 706 mots et quatre de 325 à
  336 mots, avec contexte collectif, rôle personnel, méthode, évaluation et limites.
- Sommaires natifs, étapes de méthode, figures légendées, tableaux et encadrés.
- Navigation précédent/suivant sans boucle, retours vers l’index et la galerie.
- About développé à partir du CV : Berkeley, Arts et Métiers, Dauphine, EquitX,
  CCHE, compétences et contact. CV public identique à la source, e-mail et GitHub.
- `npm run verify` réussi : 36 fichiers contrôlés par Astro Check sans diagnostic, onze pages
  et 236 références internes validées.
- Neuf pages éditoriales vérifiées aux quatre dimensions, sept sommaires,
  parcours complets dans les deux sens, clavier, lecture sans JavaScript et
  téléchargement du CV. Galerie inchangée : sept projets visibles à 1440 × 900.

Commit de contrôle : `feat: complete milestone 3 content components`.
La [recette et les captures](validation/jalon-3/README.md) détaillent ces contrôles ;
le [guide des contenus](CONTENT_SOURCES.md) indique leurs sources et emplacements.
Les études restent provisoires et les posters conceptuels, selon le périmètre
retenu : aucun audit de résultats ni nouvel entraînement dans ce jalon.
