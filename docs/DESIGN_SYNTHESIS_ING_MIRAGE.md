# Direction de travail — Ing Tian × Studio Mirage

Étude du 13 octobre 2026. Aucune construction du site commencée.

Emeryc souhaite prendre l'accueil d'[Ing Tian](https://ingtian.github.io/) comme
référence principale et enrichir les projets avec la créativité de
[Studio Mirage](https://studiomirage.io/). La sélection
[Awwwards Portfolio](https://www.awwwards.com/websites/portfolio/) reste une
source complémentaire. Alexander Rom et Emmanuel Sabuni restent pertinents
pour l'organisation des contenus et les pages de recherche.

## Décisions confirmées

- Le paysage de points de l'accueil accompagne l'apparition des panneaux de projets.
- Tous les projets doivent être présentés ensemble, avec un accent sur les trois phares.
- L'ordre des trois phares reste : capstone RL + signatures, Deep Hedging, Spotify.
- La galerie doit conserver une véritable ambition visuelle et de profondeur,
  nourrie par l'analyse des modules 3D de Mirage.

Cette demande remplace la proposition initiale d'un carrousel réservé aux trois
phares et d'un index séparé comme seul accès aux autres projets.

## Mélange proposé

| Partie | Référence utile | Adaptation pour Emeryc |
| --- | --- | --- |
| Premier écran | Nom ample, composition, typographie et paysage mathématique d'Ing Tian | Positionnement Quantitative Finance & Machine Learning, projets et CV directement accessibles |
| Passage aux projets | Continuité de scène et caméra de Mirage | Les points restent perceptibles tandis que les sept panneaux se mettent en place |
| Vue d'ensemble | Matières, lumière et aperçus animés de Mirage | Tous les projets visibles ; trois panneaux plus grands, quatre plus compacts |
| Sélection d'un projet | Rapprochement de caméra et ambiance liée au média | Aperçu agrandi, problème, méthodes, accès à l'étude ; retour clair à l'ensemble |
| Page projet | Entrée visuelle de Mirage et précision pédagogique d'Ing Tian | Contribution, protocole, méthode, résultats vérifiés, limites, code et rapport |

## Galerie : une proposition concrète

Sur ordinateur, essayer une composition ouverte en deux rangées : trois grands
panneaux pour le capstone, Deep Hedging et Spotify, puis quatre panneaux plus
compacts pour Transformer, Optimization 240, Data 100 et Case AKO. Tous doivent
rester lisibles et directement sélectionnables dans la vue d'ensemble.

La profondeur viendrait de l'inclinaison, du relief partagé, de la lumière et du
mouvement de caméra. Les autres projets ne seraient ni placés derrière les trois
principaux, ni révélés seulement après plusieurs changements de diapositive.
Le cadrage exact devra être validé en maquette, notamment à 1440 × 900.

Lors d'une sélection, le panneau choisi pourrait avancer et révéler un résumé,
tandis qu'un index des sept projets garderait les destinations accessibles.
Un retour explicite rétablirait la vue d'ensemble. L'ouverture de l'étude de cas
resterait une action claire, évitant d'imposer une visite complète de la scène.

Sur téléphone, proposer une vue compacte de tous les titres, puis les cartes
dans un défilement naturel. Sept grands aperçus simultanés ne seraient pas
lisibles dans une seule petite fenêtre ; aucun projet ne doit toutefois être
masqué derrière une sélection obligatoire.

## Continuité et identité

Conserver la typographie, les marges et le vocabulaire de points/trajectoires.
La palette ivoire/encre de l'accueil pourrait évoluer progressivement vers
le graphite pour mettre en valeur la lumière des projets. Ce passage de couleur
reste une proposition.

Pour les aperçus : trajectoires et signatures du capstone, surface de couverture
et pertes pour Deep Hedging, structure de recommandations pour Spotify. Les
autres projets auront eux aussi un aperçu identifiable. Distinguer les
illustrations d'ambiance des résultats scientifiques, qui devront être vérifiés.

L'analyse de Mirage confirme un procédé intéressant : des couleurs temporelles
associées aux vidéos pilotent l'éclairage du sol. Nous pouvons adapter ce principe
aux aperçus scientifiques et à notre paysage de points. Le décor de dunes, les
logos et les médias de l'agence ne constituent pas notre identité visuelle.

## Structure candidate

- `/` : accueil, transition et galerie de tous les projets, courte présentation,
  liens essentiels.
- `/projects/` : index éditorial direct de l'ensemble des projets.
- `/projects/<slug>/` : une page par étude de cas, selon un modèle commun.
- `/about/` : biographie, formation et expériences, lien CV.
- CV téléchargeable et contact directement accessible.

Les routes sont des propositions ; aucune page n'est encore construite.

## Conséquence architecturale

Ing Tian utilise Astro ; Mirage associe SvelteKit, Threlte et Three.js avec des
shaders spécifiques. Leurs idées peuvent se combiner sans reprendre toute leur stack.

Piste à examiner : pages statiques, contenus structurés et composant Three.js
isolé pour le paysage et la galerie. Porter le terrain mathématique d'Ing Tian
en points 3D permettrait de partager caméra, profondeur et transitions avec
les panneaux. Les titres, descriptions et liens resteraient en HTML.

Astro est un candidat pour les pages ; Threlte devient une option si nous
choisissons Svelte pour le composant 3D. Aucun framework n'est arrêté. Le
prototype ciblé devra vérifier la continuité visuelle, le cadrage des sept
projets, les vidéos et le coût du rendu sur ordinateur et téléphone.

## Points encore à discuter

1. Fidélité de l'accueil à Ing Tian : composition, terrain et éventuel fond fluide.
2. Disposition des sept panneaux et écart de taille entre les trois phares et les autres.
3. Palette de la galerie : transition vers le graphite ou maintien de l'ivoire.
4. Visuels de chaque projet et choix des effets de lumière, de matière et de mouvement.

## Preuves et limites

- [Ing Tian](references/ING_TIAN.md).
- [Mirage : observations](references/STUDIO_MIRAGE.md).
- [Mirage : détail des modules 3D](references/STUDIO_MIRAGE_3D.md).
- [Journal REA](references/REA_PILOT_2026-10-13.md).

Les modules publics de Mirage sont accessibles. Après la passe de 18 fichiers,
huit nouvelles passes ont récupéré des graphes auparavant exclus et détaillé
quatre sections de logique visuelle. Une capture REA de l'accueil en cours de
chargement a réussi ; les interactions et les performances restent à mesurer. La fidélité de notre future
adaptation devra être contrôlée par des essais visuels.

## Raffinements issus de la nouvelle analyse REA

La [nouvelle étude Mirage](references/STUDIO_MIRAGE_REA_DEEP.md) étaye quatre
propositions pour le prototype, en préservant les décisions confirmées :

- **Sept projets visibles, lectures vidéo limitées.** Séparer la présence des
  panneaux de l'animation de leurs médias. Préparer un aperçu fixe pour chacun,
  puis privilégier la vidéo sélectionnée et quelques animations d'ambiance.
- **Des états de scène explicites.** Relier accueil, apparition, vue d'ensemble
  et sélection à la progression du parcours ; donner aux mouvements de caméra
  et aux fondus des courbes adaptées. Prévoir des poses mobiles spécifiques.
- **HTML et 3D coordonnés.** Garder titres, liens et contenu éditorial en HTML.
  La scène fournit profondeur, matières et lumière ; ses éléments peuvent être
  alignés avec la mise en page quand cela sert la composition.
- **Un budget de rendu adaptable.** Centraliser la liste des projets, les états
  et les médias, libérer les textures inutilisées et ajuster la résolution sans
  retirer de projets. Mesurer ces choix lors des essais visuels.

Les valeurs de Mirage servent à comprendre un mécanisme ; elles ne constituent
pas encore les bons réglages de notre portfolio. Le choix de stack, la disposition
exacte et la palette restent à discuter.
