# Ing Tian — premier pilote REA

Étude du 13 octobre 2026 (PDT ; 14 octobre UTC). Référence principale pour l'accueil.
Statut : observation visuelle et analyse statique ciblée terminées ; audit global non exhaustif.

## Périmètre et méthode

- Pages observées : [accueil](https://ingtian.github.io/) et [projets](https://ingtian.github.io/projects/).
- Navigateur intégré : accueil sur ordinateur, viewport mesuré 1280 × 720 ; première observation étroite mesurée 479 × 827 ; index de projets à 390 × 844. Il s'agit de dimensions de navigateur, pas d'essais sur téléphone physique.
- États : accueil au repos, défilement vers l'interlude puis le premier module pédagogique, index des projets.
- Lecture du HTML, du CSS et du JavaScript réellement publiés. Pas de présomption de correspondance avec un dépôt source.
- REA 6.4.0, CLI officielle npm, Node 24.15.0. Analyse statique du terrain et de ses dépendances ; détails et limites dans [REA_PILOT_2026-10-13.md](REA_PILOT_2026-10-13.md).

## Observé dans le navigateur

L'accueil utilise un fond ivoire, un grand nom en caractères à empattements, une partie du nom en italique, des annotations monospace et une biographie décalée sur la droite en largeur ordinateur. Une navigation compacte, arrondie et translucide donne accès aux pages, profils, CV et au thème. Elle devient un bouton de menu en largeur étroite.

Le paysage de points occupe l'arrière-plan et reste cohérent avec l'identité scientifique. Le défilement conduit à une courte déclaration, puis à une longue explication du domaine de recherche, à un parcours personnel et à une annexe donnant accès aux réalisations.

Le premier module pédagogique place des étapes explicatives à gauche et une représentation graphique à droite. Le site alterne donc contemplation, explication et preuves. L'index Projects est beaucoup plus textuel : cartes verticales, description, détails techniques, stack et lien GitHub.

## Confirmé par le code publié et les styles

- **Astro** : fichiers de composants `.astro`, ClientRouter et événements `astro:page-load`.
- **TerrainHero en Canvas 2D** : appel `getContext("2d")`, cercles dessinés avec `arc`, projection et tri par profondeur calculés en JavaScript.
- **Surface** : somme de cinq bosses/creux gaussiens, échantillonnée sur environ 33 × 33 positions. Le relief est projeté avec deux rotations fixes. Le volume provient aussi de la couleur, de la taille, de l'éclairage et d'une atténuation suivant les voisins.
- **Marcheurs** : le gradient analytique de la surface détermine une descente ; les positions sont simplifiées en dix étapes visibles, avec une trace lumineuse et une bulle terminale.
- **Animation** : faible oscillation sinusoïdale de hauteur ; boucle requestAnimationFrame avec intervalle de dessin supérieur à 33 ms. C'est une cadence visée dans le code, pas une mesure de FPS.
- **Gestion du coût** : ratio de pixels plafonné à 2, arrêt de l'animation du terrain hors champ via IntersectionObserver, image fixe si `prefers-reduced-motion` est actif.
- **Autre couche distincte** : FluidSky utilise WebGL pour le fond fluide. Ne pas décrire l'ensemble du site comme entièrement dessiné en Canvas 2D.
- **Typographie/palette** : Georgia pour le grand titre, JetBrains Mono pour les annotations, police système pour le corps ; variables CSS `--paper: #efe9dd`, `--ink-1: #16140f`, `--ochre: #c8a36a`, `--indigo: #6d7689`.
- Aucun gestionnaire de pointeur n'a été repéré dans les trois scripts du terrain étudiés. Le mouvement observé du terrain est temporel ; ne pas inventer une attraction des particules par le curseur.

Sources techniques déployées :

- [TerrainHero](https://ingtian.github.io/_astro/TerrainHero.astro_astro_type_script_index_0_lang.Bqm68QFw.js)
- [Fonctions de terrain](https://ingtian.github.io/_astro/terrain.BfFMUilB.js)
- [Préférence de mouvement](https://ingtian.github.io/_astro/motion.u94fiHpI.js)
- [FluidSky](https://ingtian.github.io/_astro/FluidSky.astro_astro_type_script_index_0_lang.BbCRsvPq.js)
- [Styles globaux](https://ingtian.github.io/_astro/BaseLayout.DjMwr1Z_.css)

## Paramètres utiles pour nos essais

| Paramètre | Valeur ou mécanisme étudié | Variation possible |
| --- | --- | --- |
| Géométrie | 5 gaussiennes, centres, amplitudes et largeurs distincts | Composer notre propre surface de perte ou paysage de risque illustratif |
| Échantillonnage | Domaine ±2,6 ; pas 0,16 | Modifier densité et coût de calcul |
| Caméra | Rotation horizontale 0,18π, inclinaison 0,92 rad | Dégager de l'espace autour du nom et de la biographie |
| Zoom du terrain | 0,85 dans TerrainHero | Ajuster le relief à la composition |
| Respiration | Amplitude 0,04 ; phase fonction du temps et des positions | Ralentir ou figer le fond |
| Descente | Pas de gradient 0,16 ; au plus 140 itérations ; 10 positions retenues | Montrer une recherche d'optimum, sans la présenter comme un résultat expérimental |
| Traces | Étapes espacées de 680 ms ; fondu progressif | Rendre la trajectoire plus ou moins présente |
| Apparence | Palettes clair/sombre, taille et opacité des points, éclairage | Préserver un vocabulaire scientifique commun aux projets |

## À conserver et à améliorer pour Emeryc

Conserver la composition de l'accueil, la sobriété de la palette, le contraste serif/monospace et le sens mathématique du mouvement. Adapter le nom, la longueur des textes et la surface à nos vrais contenus.

Présenter les trois projets prioritaires rapidement après l'accueil. La longue explication de la recherche d'Ing Tian répond à son récit personnel ; pour Emeryc, les explications approfondies trouveraient leur place dans les pages de cas. Ajouter des accès explicitement libellés « Explore my work » et « Download CV » au premier écran.

L'index de ses projets apporte une bonne densité d'information, mais nous proposons de l'enrichir avec les aperçus visuels et les transitions de Mirage.

## Limites

L'étude n'est pas un audit complet de l'accessibilité, des performances ou de toutes les pages. Les garanties de mouvement réduit ont été lues dans le code, sans test système correspondant. Le terrain est compris suffisamment pour préparer un essai, pas encore reproduit ni validé par comparaison visuelle. Les éventuelles reprises de code ou de polices devront conserver leur provenance et leurs conditions de réutilisation.
