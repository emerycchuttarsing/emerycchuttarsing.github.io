# Architecture du portfolio

## Décisions du jalon 1

Astro génère un site statique pour `https://emerycchuttarsing.github.io/`, à la
racine du domaine. TypeScript utilise le mode strictest. Three.js fournit désormais la scène commune de l’accueil. Node est fixé par `.nvmrc` et les
versions des dépendances sont enregistrées dans `package-lock.json`.

Le navigateur reçoit du HTML pour les titres, textes et liens. La navigation
entre pages utilise des liens natifs. La scène reste limitée à l’accueil
et est chargée par import dynamique côté navigateur. Aucun serveur applicatif n'est nécessaire à ce stade.

## Contenu et génération

Chaque fichier `src/content/projects/*.md` est la source unique d'un projet :
son nom de fichier fournit l'identifiant et l'URL, son frontmatter fournit les
métadonnées, son corps fournit l'étude. Le schéma dans `src/content.config.ts`
valide les champs. `src/lib/projects.ts` vérifie aussi le nombre de projets,
l'ordre, les trois phares, les corps de texte et les médias locaux.

L'accueil et l'index utilisent la même liste. `getStaticPaths()` génère les sept
études à partir de cette collection. `toSceneProject()` transforme ces données
en une vue sérialisable pour la scène, sans fichiers privés ni accès disque.

Les brouillons sont visibles et identifiés. Les liens facultatifs absents ne
créent pas de boutons actifs. Les corps actuels reprennent les méthodes du brief
et des sources locales ; ils ne revendiquent pas de performances numériques.

## Traduction des analyses REA

- Ing Tian : terrain mathématique échantillonné en points Three.js.
- Mirage : scène commune, profondeur des panneaux, poses et fondus distincts.
- Sept projets : trois phares, quatre secondaires, tous accessibles en HTML.
- États prévus : hero, reveal, overview, selected, fallback.
- Vidéos : poster immédiat, deux lectures sur ordinateur, une sur configuration contrainte.
- Cycle de vie : pause hors champ, respect du mouvement réduit et libération explicite des ressources.

## Réalisation du jalon 2

L’accueil assemble `Hero`, `ProjectGallery`, `AboutTeaser` et `PortfolioScene`.
Une scène transparente fixe partage terrain, caméra et sept panneaux. Le passage
`hero` → `overview` se fait au franchissement du milieu de l’écran par la galerie.
Les poses sont fixes ; le défilement reste natif. Les panneaux sont des boîtes
fines éclairées, avec un poster sur la face avant et un cadre métallique.
Leurs positions sont calculées à partir des rectangles HTML de la grille.

À partir de 1100 × 800, la grille de douze colonnes réserve quatre colonnes à
chaque phare et trois à chaque secondaire. En dessous de ce seuil, les panneaux
restent des images HTML : deux colonnes dès 640 px, une en dessous. Les titres,
liens et focus clavier restent toujours en HTML. Les textes et URLs proviennent
de la même collection qu’au jalon 1.

Les rendus sont déclenchés par les changements, sans boucle permanente. Le
cycle de vie couvre les chargements tardifs, les redimensionnements hors champ,
la préférence de mouvement réduit, les retours navigateur et les pertes de
contexte WebGL. Les ressources GPU sont libérées à la sortie de l’accueil.

Les styles sont répartis entre `tokens.css`, `global.css` (navigation et gabarits
éditoriaux), `home.css` (accueil et galerie), et le style propre à l’index.
Les posters sont sept SVG originaux et illustratifs. Les études restent des
brouillons. Le périmètre adopté au jalon 3 conserve les illustrations conceptuelles
et reporte l’intégration des résultats chiffrés à une revue ultérieure.
Les types `reveal` et `selected`, durées et budgets vidéo préparent le jalon 4.

## Réalisation du jalon 3

`ProjectHeader` expose contexte, rôle, technologies et contributions issus du
frontmatter. `ProjectFigure` affiche le poster et sa légende conceptuelle.
`render(project)` fournit le contenu Markdown et ses titres : `TableOfContents`
construit des liens d’ancrage natifs depuis les titres de niveau 2.
`MethodDiagram` présente les trois étapes du frontmatter sous forme de liste HTML.
`Prose` définit la colonne de lecture, les listes, tableaux, figures et encadrés.

`ProjectNavigation` reçoit les voisins calculés à partir de l’ordre de la collection.
Le premier projet n’a pas de précédent, le dernier n’a pas de suivant. Les liens
vers l’index et la galerie restent présents aux deux extrémités.
`ProjectResources` est partagé par l’index et les études ; les destinations
manquantes ne génèrent aucun bouton.

Le sommaire reste latéral et sticky au-dessus de 900 px, puis précède le texte.
Les étapes de méthode passent de trois colonnes à une sous 700 px. La galerie
et le contrat `SceneProject` ne reçoivent pas les longs contenus éditoriaux.
Aucun de ces composants ne nécessite de JavaScript ni de nouvelle dépendance.

`site.ts` centralise biographie, formations, expériences, compétences et liens.
`ProfileTimeline`, `SkillGroups` et `ProfileLinks` les présentent dans About ;
les liens du pied de page et le texte court de l’accueil utilisent cette source.
Le CV est une copie inchangée du document fourni, servie depuis `public/resume/`.
Le champ LinkedIn reste disponible mais vide.

Les contenus, leur provenance et les emplacements de remplacement sont décrits
[dans le guide éditorial](CONTENT_SOURCES.md). La recette du jalon 3 couvre
également les parcours, les contenus statiques et le téléchargement.

## Vérification et hébergement

`npm run verify` regroupe formatage, vérification Astro, construction et contrôle
de la sortie. Le contrôleur utilise parse5 pour vérifier le HTML généré, les
pages attendues, les liens locaux et les ancres. Les parcours sont également
examinés dans le navigateur au moment de la livraison.

La CI exécute la même commande. Le workflow Pages, déclenché manuellement sur
`main`, reconstruit et valide avant d'envoyer uniquement `dist/`. Son premier
fonctionnement distant sera vérifié au moment de la publication.

Références officielles consultées : [collections Astro](https://docs.astro.build/en/guides/content-collections/),
[GitHub Pages avec Astro](https://docs.astro.build/en/guides/deploy/github/).
