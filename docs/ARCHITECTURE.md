# Architecture du portfolio

## Décisions du jalon 1

Astro génère un site statique pour `https://emerycchuttarsing.github.io/`, à la
racine du domaine. TypeScript utilise le mode strictest. Three.js est installé
pour la scène prévue aux prochains jalons. Node est fixé par `.nvmrc` et les
versions des dépendances sont enregistrées dans `package-lock.json`.

Le navigateur reçoit du HTML pour les titres, textes et liens. La navigation
entre pages utilise des liens natifs. La future scène reste limitée à l'accueil
et sera chargée côté navigateur. Aucun serveur applicatif n'est nécessaire à ce stade.

## Contenu et génération

Chaque fichier `src/content/projects/*.md` est la source unique d'un projet :
son nom de fichier fournit l'identifiant et l'URL, son frontmatter fournit les
métadonnées, son corps fournit l'étude. Le schéma dans `src/content.config.ts`
valide les champs. `src/lib/projects.ts` vérifie aussi le nombre de projets,
l'ordre, les trois phares, les corps de texte et les médias locaux.

L'accueil et l'index utilisent la même liste. `getStaticPaths()` génère les sept
études à partir de cette collection. `toSceneProject()` transforme ces données
en une vue sérialisable pour la future scène, sans fichiers privés ni accès disque.

Les brouillons sont visibles et identifiés. Les liens facultatifs absents ne
créent pas de boutons actifs. Les corps actuels reprennent les méthodes du brief ;
ils ne revendiquent pas de performances numériques non vérifiées.

## Traduction des analyses REA

- Ing Tian : terrain mathématique à porter en points Three.js.
- Mirage : scène commune, profondeur des panneaux, poses et fondus distincts.
- Sept projets : trois phares, quatre secondaires, tous accessibles en HTML.
- États prévus : hero, reveal, overview, selected, fallback.
- Vidéos : poster immédiat, deux lectures sur ordinateur, une sur configuration contrainte.
- Cycle de vie : pause hors champ, respect du mouvement réduit et libération explicite des ressources.

Les fichiers `src/scene/types.ts` et `config.ts` décrivent ces besoins. Ils ne
constituent pas encore un moteur 3D ou une machine à états exécutée. Les poses,
durées et budgets sont des points de départ à vérifier pendant les essais visuels.

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
