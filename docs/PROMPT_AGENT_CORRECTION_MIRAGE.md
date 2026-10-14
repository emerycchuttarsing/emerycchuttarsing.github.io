# Mission IA — corriger la présentation des projets vers Mirage Works

Version du 14 octobre 2026. Ce fichier peut être transmis tel quel à une IA codeuse ayant accès au dépôt. Il rassemble les consignes d’exécution ; les documents liés apportent les preuves et détails supplémentaires.

## 1. Objectif et périmètre

Modifie le portfolio existant dans `/Users/emeryc/Portfolio/emerycchuttarsing.github.io` pour rapprocher sa présentation des projets de **[Studio Mirage — Works](https://studiomirage.io/works)** : une liste de projets superposée à un paysage 3D sombre, avec panneaux vidéo, relief, profondeur et lumière localisée.

Applique cette composition à la section projets de `/` **et** à `/projects/`. Conserve le premier écran de l’accueil inspiré d’Ing Tian, ses points, les sept projets et leurs études. Réalise les modifications et leur validation, au-delà d’un simple plan ou prototype.

Le site utilise déjà **Astro + TypeScript + Three.js**, avec génération statique pour GitHub Pages. Dernier état inspecté : commit `937bbb3`, jalon 4. Vérifie l’état actuel et préserve les modifications existantes avant d’agir ; ce commit est un repère, pas une instruction de réinitialisation.

**Priorité documentaire pour cette correction :** nouvelles instructions de l’utilisateur → ce fichier → [spécification détaillée](CORRECTIFS_GALERIE_MIRAGE.md) → briefs historiques. Cette priorité concerne les choix du projet, dans le respect des instructions applicables à ton environnement.

Les anciennes consignes de grille 3 + 4, d’index clair séparé et de scène limitée à l’accueil sont remplacées. Le texte et les images peuvent être provisoires ; la composition et l’ambiance ci-dessous doivent être réalisées.

## 2. Résultat obligatoire

| ID  | Exigence                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Présentation presque noire, titre sans empattements, lignes fines en HTML devant un décor 3D visible. Les lignes traversent visuellement le décor, au lieu de former une section entièrement placée après celui-ci.                                   |
| V2  | À 1440 × 900 et 1280 × 800, vue d’ensemble stable : sept noms, sept liens et sept panneaux discernables simultanément, sans survol préalable. Sur `/`, cette exigence s’applique lorsque la section projets est cadrée, pas au premier écran du hero. |
| V3  | Trois phares plus présents par taille, placement et mention `Featured`. Les quatre autres gardent une vraie présence. Conserver l’ordre et les identifiants existants.                                                                                |
| V4  | Panneaux disposés dans l’espace, avec orientations et profondeur propres ; relief continu perceptible, halos localisés, bloom discret et vignettage maîtrisé. Une grille HTML simplement inclinée en 3D ne satisfait pas ce résultat.                 |
| V5  | Depuis l’accueil, le paysage de points accompagne l’apparition du relief et des panneaux. Sur `/projects/`, entrée directe dans l’état d’ensemble, sans dépendance au hero.                                                                           |
| V6  | Au survol **et** au focus clavier, la ligne et son panneau gagnent en présence ; les autres restent visibles. Le lien du titre ouvre directement l’étude. Un bouton `Preview` distinct ouvre l’aperçu.                                                |
| V7  | Sur mobile, les sept projets restent présents dans une liste qui défile naturellement. Aucun projet réservé au survol, aucun débordement horizontal, noms lisibles. À zoom élevé, autoriser le défilement plutôt que couper le contenu.               |
| V8  | Sans JS/WebGL, après perte de contexte ou avec mouvement réduit : décor statique cohérent et sept liens utilisables. Conserver les garanties clavier, historique et médias existantes.                                                                |

Les études `/projects/<id>/` et `/about/` restent éditoriales. Garde leurs contenus, les URLs, le CV et les contacts. La correction ne demande ni backend supplémentaire, ni migration de framework, ni publication automatique.

## 3. Réglages ajustables et adaptations assumées

Ces valeurs sont des points de départ **pour notre portfolio**, à ajuster pour satisfaire V1–V8. Ce ne sont pas toutes des mesures de Mirage.

- À 1440 × 900 : fond proche de `#050607`, marges 32–48 px, titre 30–36 px, première ligne vers y = 285–310 px, lignes de 62–68 px, septième ligne entièrement visible avant environ y = 800 px.
- À 1280 × 800 : réduire respiration et hauteur des lignes vers 56–62 px. Conserver un `h1` sur l’index et un `h2` dans la section d’accueil.
- Décor au tiers supérieur/milieu du cadre, sol derrière plusieurs lignes. Arc ouvert, sept panneaux exposés ; phares environ 1,25–1,4 fois plus grands. À 1440 × 900, viser au moins 90 px de largeur projetée et 70 % de face exposée pour chaque secondaire.
- Caméra Works : tester un FOV de 15–20°, en réglant simultanément recul, cible et dimensions. Préserver le cadrage initial du hero.
- Accentuation visuelle : 200–350 ms ; demande de priorité vidéo après 120 ms, annulable. Léger éclat sur les séparateurs près du pointeur et équivalent au focus.
- Vidéos : deux lectures simultanées maximum sur ordinateur, une en configuration contrainte. DPR initial plafonné autour de 1,3 ; adapter après mesure.

Les différences voulues avec Mirage sont l’exposition ouverte de sept identités distinctes, la priorité des trois phares, le paysage mathématique et la liste mobile ordinaire. Le cercle fermé, l’aperçu global d’un seul projet et la roue mobile de Mirage ne remplacent pas ces exigences.

Chaleur, déformation fluide au pointeur et filtres peuvent être différés. La composition, le relief, la lumière, les médias et les parcours restent nécessaires. Les noms des nouveaux modules sont libres ; leurs responsabilités doivent rester claires.

## 4. Mécanismes vérifiés par REA à réutiliser

| Source retrouvée chez Mirage                                                                                                                                                 | Traduction attendue                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ProjectIndex` / `ro`, module `DO3l11rT.js` : liste associée à l’état `pIndex` ; survol → `w`, délai 120 ms ; sortie → `te` → `q`, annulation et restauration conditionnelle | Relier HTML et scène par état partagé ; annuler les demandes obsolètes ; ne pas confondre survol et ouverture modale.          |
| Caméra perspective 15° ; `Hu.pIndex` : cible desktop `[0, 0.1, 0]`, rayon 21, inclinaison 1,434 rad ; variante mobile distincte                                              | Créer une pose Works. Adapter ces valeurs à notre échelle ; ne pas copier les nombres dans la scène actuelle sans recadrage.   |
| `Vc` / `au` : panneaux fins à géométrie partagée, textures vidéo, disposition dans le monde                                                                                  | Découpler les panneaux des rectangles de la grille HTML actuelle.                                                              |
| `Gc`, `zc`, `Bt`, shader `lu` : couleurs temporelles des vidéos et contributions spatiales au sol                                                                            | Préparer des courbes de couleurs locales et éclairer le relief selon le temps des vidéos ; garder une couleur fixe de secours. |
| `Ww`, `I_`, `Ow` : sections HTML comme repères ; courbes distinctes de pose et de fondu                                                                                      | Une progression de transition commune, avec courbes séparées pour caméra, points, sol et panneaux.                             |
| CSS `ProjectIndex` : séparateurs fins, fond translucide au survol, éclat radial masqué sur les traits                                                                        | Réaliser aussi la finesse de la liste en CSS, avec contraste conservé.                                                         |

Les observations viennent de REA **et** de la lecture manuelle des sources. Le graphe ciblé `ProjectIndex` n’est pas tronqué par les ressources, mais sa couverture reste `unknown` ; il ne prouve pas toutes les interactions en exécution.

Pour les détails, lire la **section 10** de la [spécification](CORRECTIFS_GALERIE_MIRAGE.md), puis les [preuves Works](references/evidence/MIRAGE_WORKS_REA_EVIDENCE.json) ou la [fiche 3D](references/STUDIO_MIRAGE_3D.md) selon le besoin. Éviter de charger tous les rapports bruts. Reconstruire ces mécanismes pour nos données ; aucun script ou média hébergé par Mirage ne doit devenir une dépendance du portfolio.

## 5. Carte des modifications

Tous les chemins de code ci-dessous sont relatifs au dépôt.

| Fichiers existants                                                              | Travail attendu                                                                                                                                                                          |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/index.astro`, `src/pages/projects/index.astro`                       | Utiliser une présentation commune. Monter la scène en mode `home` ou `index`, avec un seul dialogue et un seul canvas par document.                                                      |
| `src/components/ProjectGallery.astro`, `ProjectList.astro`                      | Remplacer leurs usages principaux par des lignes accessibles, sans grandes vignettes ni paragraphes sous chaque panneau. Des composants `ProjectsShowcase` et `ProjectRows` conviennent. |
| `src/components/PortfolioScene.astro`, `src/scene/mount.ts`, `types.ts`         | Mode explicite, références DOM injectées, hero facultatif ; distinguer état du parcours et `activeProjectId`.                                                                            |
| `src/scene/renderer.ts`, `config.ts`                                            | Layout spatial déterministe, pose Works, cadrage des sept panneaux, transitions et effets. Réserver `placeAtPixel()` à un besoin local tel que l’aperçu.                                 |
| `src/scene/terrain.ts` et nouveaux modules ciblés                               | Fonction de hauteur commune aux points et au maillage ; normales, matière, halos, courbes de couleurs, post-traitement et libération des ressources.                                     |
| `src/scene/media.ts`, `selection.ts`, `src/components/ProjectPreview.astro`     | Adapter visibilité/priorité vidéo et nouveaux déclencheurs, en conservant pause, dialogue, historique et restauration du focus.                                                          |
| `src/styles/home.css`, `global.css`, `tokens.css`, nouveau `works.css` si utile | Retirer la grille du parcours Works ; thème sombre et styles de liste limités à leur périmètre. Préserver le hero et les pages éditoriales.                                              |
| `src/layouts/BaseLayout.astro`, composants de navigation/pied de page           | Thème approprié sur `/projects/`, sans fond clair accidentel ni changement global de typographie.                                                                                        |
| `src/content.config.ts`, `src/lib/projects.ts`, `public/media/`                 | Même source de projets ; `displayTitle` facultatif si nécessaire ; courbes de couleurs et fallback remplaçables.                                                                         |

## 6. Points d’implémentation à respecter

1. Le renderer actuel suppose la présence du hero et mesure les rectangles des cartes. Corriger ces dépendances avant de le monter sur `/projects/` ; cette route commence directement en `overview`.
2. Garder les états `hero`, `reveal`, `overview`, `selected`, `fallback`. Le survol/focus ne change que le projet actif : aucun dialogue ni historique à cette étape. Le focus clavier a priorité sur le pointeur.
3. Le gestionnaire vidéo actuel utilise la visibilité des parents HTML et déplace la vidéo sélectionnée dans le dialogue. Fournir une visibilité de scène/panneau adaptée ; **ne pas appeler son actuel `select()` pour un simple survol**. Des vidéos sources cachées ne doivent pas être considérées toutes hors champ.
4. Partager la fonction du relief entre points et surface. Faire apparaître la surface et les panneaux progressivement, avec retour réversible au hero. Retirer la coupure `.atmosphere` si elle empêche la continuité.
5. Les faces vidéo n’éclairent pas automatiquement le sol. Implémenter les contributions colorées avec atténuation spatiale et normales. Synchroniser les trois médias phares avec des courbes préparées hors ligne ; pas d’extraction de pixels à chaque frame. Adapter les tableaux et boucles à sept projets.
6. Composer bloom et vignettage sur la scène, avec texte HTML au-dessus. Conserver des espaces colorimétriques cohérents. Éviter l’occlusion du décor par un fond opaque des lignes.
7. Garder posters, refus d’autoplay, pause manuelle et arrêt hors champ/en onglet masqué. Après arrêt des médias et effets temporels, arrêter les frames une fois la scène stable. Nettoyer textures, observateurs, callbacks et render targets.
8. Le titre reste un lien natif et `Preview` un bouton distinct. Conserver Échap, focus, Retour/Avancer et restauration après retour d’une étude. Les navigations de documents peuvent reconstruire la scène ; aucune SPA n’est nécessaire.

## 7. Ordre de travail

1. **Inspecter** le code actuel, les instructions du dépôt et les captures avant correction. Ouvrir Mirage Works pour confirmer la composition ; si la référence est inaccessible, utiliser l’analyse conservée et déclarer cette limite.
2. **Construire** la présentation HTML commune et son thème sur les deux routes ; cadrer les sept lignes.
3. **Réaliser** le layout spatial, la caméra, le sol, les halos et la finition lumineuse. Comparer visuellement avant d’accumuler des effets secondaires.
4. **Relier** transition du hero, focus/survol, vidéos et aperçu ; traiter mobile et replis.
5. **Vérifier et ajuster** jusqu’à satisfaire V1–V8 ; mettre à jour les documents d’architecture et de validation.

Prendre les décisions courantes à partir de ce contrat. Signaler une contradiction ou un blocage concret avec son impact, tout en poursuivant les parties indépendantes. Ne pas considérer les contenus provisoires comme un blocage.

## 8. Vérification et livraison

Lancer `npm run verify` et les contrôles navigateur adaptés à la modification. Les anciens scripts utilisent `.gallery-grid` et `[data-panel]` : actualiser leurs assertions sans perdre la couverture des sept projets et des parcours. Les études restent sans canvas ; `/projects/` en reçoit désormais un.

Conserver dans `docs/validation/mirage-correction/` les preuves suivantes :

- Mirage `/works` et notre `/projects/` stabilisés au même viewport 1440 × 900, comparés côte à côte ; dater la référence et décrire les écarts de composition, matière, lumière et typographie.
- Notre vue d’ensemble à 1280 × 800, 768 × 1024 et 390 × 844 ; hero conservé et transition intermédiaire sur `/`.
- Un phare et un secondaire mis en valeur, un aperçu ouvert, les replis et les résultats des parcours clavier/navigation.
- Mesures de fluidité et budget vidéo, absence d’exceptions, de doubles canvases ou de ressources accumulées après plusieurs navigations. Identifier les navigateurs réellement testés et les profils seulement simulés.

**La correction est terminée lorsque V1–V8 sont vérifiés techniquement et visuellement.** Un build réussi ou les captures des anciens jalons ne suffisent pas. Comparer les structures malgré des médias différents, sans présenter une ressemblance comme validée si aucune comparaison n’a été possible.

Dans la livraison, fournir : fichiers changés, captures, tableau V1–V8 avec preuve/statut, commandes réellement exécutées et résultats, écarts restants et état de publication. Séparer clairement terminé, non vérifié et restant à faire. La publication conserve le workflow GitHub Pages existant et suit les instructions de l’utilisateur ; cette correction n’ajoute aucun déploiement automatique.
