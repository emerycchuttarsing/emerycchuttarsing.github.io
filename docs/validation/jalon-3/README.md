# Recette du jalon 3 — Composants de contenu

Vérification locale du 13 octobre 2026 (14 octobre UTC), sous Chrome
**155.0.8059.79**, sur l’aperçu Astro `http://127.0.0.1:4321/`.
Branche : `codex/portfolio`. Aucun déploiement public.

## Résultat

Les sept fiches ont été développées avec en-tête, contexte, rôle personnel,
contributions, poster légendé, sommaire natif, schéma de méthode, corps Markdown
et navigation entre études. Les ressources facultatives ont un composant commun ;
aucune destination de code, rapport ou démo n’est actuellement renseignée dans
les fiches, donc aucun bouton correspondant n’est affiché.

About rassemble biographie, deux expériences, trois formations, compétences,
GitHub, e-mail et téléchargement du CV. Le contenu reste en anglais. Les études
sont identifiées comme provisoires et les posters comme illustrations conceptuelles.
Le [guide éditorial](../../CONTENT_SOURCES.md) décrit les composants et remplacements.

| Étude              | Mots dans le corps rendu |
| ------------------ | -----------------------: |
| Capstone RL        |                      678 |
| Deep Hedging       |                      674 |
| Spotify            |                      706 |
| TinyStories        |                      335 |
| Link Prediction    |                      332 |
| Visual Learning    |                      325 |
| Retail Forecasting |                      336 |

Le comptage inclut les titres et tableaux Markdown, mais exclut l’en-tête, la
légende d’ouverture, le schéma de méthode et les liens de navigation. Les trois
phares respectent 600–800 mots ; les quatre autres 250–400.

## Contrôles exécutés

- `npm run verify` : formatage conforme, Astro Check sur 36 fichiers sans erreur,
  avertissement ni hint ; build statique de onze routes ; 236 références locales
  et ancres vérifiées.
- `scripts/check-content-browser.mjs` : les sept études, l’index et About à
  **1440 × 900**, **1280 × 800**, **768 × 1024** et **390 × 844**. Aucun débordement
  horizontal ni titre, figure, tableau ou nouveau bloc hors de la largeur utile.
- Sommaires : concordance avec les titres rendus, cibles uniques, activation
  native des ancres. Position sticky sur ordinateur et avant le texte en compact.
- Méthode : trois étapes horizontales au-dessus de 700 px, verticales sur téléphone.
- Navigation : les six liens suivants puis les six précédents ont été parcourus
  réellement. Pas de précédent au premier projet ni de suivant au dernier.
  Retour à l’index, retour navigateur et retour à la galerie réussis.
- Clavier : lien d’évitement, focus visible sur les sept entrées du sommaire de
  l’étude phare, activation avec Entrée. Les liens restent des ancres HTML.
- JavaScript désactivé : sept études ouvertes directement à 390 × 844, corps et
  étapes présents, ancres utilisables, aucun débordement. About et CV accessibles.
- CV : téléchargement effectif sous le nom attendu ; statut HTTP 200,
  `application/pdf`, **156 179 octets**. SHA-256 identique à la copie publique et
  au document fourni :
  `f631314864111a11db84a022e44a49d282e00e0002cfa17fc65a142152a239ba`.
- E-mail : liens vers `mailto:emeryc.chuttarsing@berkeley.edu` ; aucun envoi.
  Aucun lien LinkedIn affiché.
- Galerie : sept panneaux et titres entièrement visibles à 1440 × 900, entre
  environ 212 et 828 px verticalement. La scène du jalon 2 est conservée.
- Aucune erreur de console ou exception de page relevée pendant cette recette.
- Identité du CV source et de la copie confirmée séparément par `shasum -a 256`.

Les mesures détaillées figurent dans [report.json](report.json). Le script produit
également les captures complètes dans `test-results/jalon-3/`, ignoré par Git ;
une sélection est conservée ci-dessous.

## Captures

### Études sur ordinateur

- [En-tête de l’étude phare, 1440 × 900](study-header-1440x900.png)
- [Poster et légende conceptuelle, 1440 × 900](study-figure-1440x900.png)
- [Sommaire, méthode et texte, 1440 × 900](study-method-1440x900.png)
- [Même composition à 1280 × 800](study-method-1280x800.png)
- [Index enrichi à 1440 × 900](index-1440x900.png)

### Écrans compacts

- [Sommaire avant le texte à 768 × 1024](study-method-768x1024.png)
- [En-tête à 390 × 844](study-header-390x844.png)
- [Méthode verticale à 390 × 844](method-phone.png)
- [Tableau du capstone à 390 × 844](study-table-390x844.png)
- [Tableau Deep Hedging à 390 × 844](hedging-table-phone.png)
- [Tableau Spotify à 390 × 844](recommendation-table-phone.png)

### Profil et galerie

- [About à 1440 × 900](about-1440x900.png)
- [Expériences sur ordinateur](experience-desktop.png)
- [Formations à 768 × 1024](education-768x1024.png)
- [Contact et CV à 390 × 844](contact-390x844.png)
- [Sept panneaux et titres à 1440 × 900](gallery-1440x900.png)

## Limites de ce point de contrôle

Les tailles compactes sont des fenêtres Chrome simulées, pas des essais sur
appareils physiques. Safari et Firefox n’ont pas été exécutés pour ce jalon.
Les replis WebGL et le cycle de vie Three.js restent couverts par la
[recette du jalon 2](../jalon-2/README.md) ; le moteur n’a pas été modifié ici.
Le build signale toujours le volume du bundle Three.js chargé uniquement sur
l’accueil, avertissement déjà documenté au jalon 2.

La lecture des sources a servi à expliquer les méthodes et leurs limites, sans
relancer les modèles ni certifier des performances. Les figures de résultats,
les liens de ressources à fournir et les contenus définitifs pourront remplacer
ces éléments. Les animations, vidéos et états sélectionnés relèvent du jalon 4 ;
la finition responsive et la recette finale relèvent du jalon 5.
