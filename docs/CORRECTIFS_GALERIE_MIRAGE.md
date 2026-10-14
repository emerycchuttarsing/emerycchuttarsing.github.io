# Correctifs de la présentation des projets — référence Mirage Works

> **Passation à une IA codeuse :** utiliser d’abord le [contrat d’exécution condensé](PROMPT_AGENT_CORRECTION_MIRAGE.md). Il fixe les exigences et critères de livraison ; le présent document reste la référence détaillée pour les mécanismes REA et les choix techniques.

Document de passation à l’agent codeur · 14 octobre 2026.

Dépôt : `/Users/emeryc/Portfolio/emerycchuttarsing.github.io`.
État inspecté : commit `937bbb3` (`feat: complete milestone 4 interactivity`), arbre de travail propre au début de cette rédaction.

**Mission : rapprocher nettement la présentation de l’ensemble des projets de [Studio Mirage — Works](https://studiomirage.io/works), tout en conservant l’accueil inspiré d’Ing Tian, les sept projets et la priorité des trois phares.**

Ce document décrit les corrections à développer. Elles ne sont pas encore implémentées ni validées visuellement. Les mesures proposées ci-dessous sont des cibles pour notre portfolio, pas des mesures prétendument extraites de Mirage. La section 10 relie les corrections aux fonctions et paramètres réellement retrouvés, avec une nouvelle passe REA dédiée au composant de `/works`.

## 1. Priorité sur le brief précédent

Pour la présentation des projets, ce document remplace les orientations contradictoires de [BRIEF_AGENT_CODEUR.md](BRIEF_AGENT_CODEUR.md), notamment :

- la grille de trois grandes cartes au-dessus de quatre petites ;
- l’index `/projects/` présenté comme une page éditoriale claire indépendante du décor ;
- la limitation du moteur 3D à l’accueil ;
- la liberté de changer la composition, la typographie de la galerie et son ambiance sans conserver la proximité avec Mirage.

Les autres fondations restent utiles : Astro, TypeScript, Three.js, génération statique, collections de contenu, liens natifs, études de cas, accessibilité et gestion des médias. La liberté sur les **textes et images provisoires** ne vaut pas liberté de remplacer la direction visuelle.

La correction concerne **les deux points d’entrée** : la section projets de `/` et la page `/projects/`. Ils emploient la même composition et le même moteur. L’accueil garde son premier écran actuel ; le défilement transforme progressivement son paysage de points en décor de la présentation des projets. `/projects/` ouvre directement cette présentation dans son état stable.

Les pages `/projects/<id>/` et `/about/` restent éditoriales. Cette correction ne nécessite ni nouveau backend ni migration vers SvelteKit.

## 2. Référence visuelle et résultat attendu

### Ce qui a été observé chez Mirage

Sur `/works`, des lignes de projets se superposent à un décor sombre : panneaux vidéo dans un relief éclairé, espace noir au-dessus, typographie sans empattements, séparateurs fins, catégories discrètes. La liste et la scène partagent le même écran. La scène sert à la fois d’exposition et d’arrière-plan ; les réalisations ne sont pas présentées comme une grille de vignettes avec leurs légendes dessous.

Les études précédentes documentent le moteur commun, les panneaux, le sol, les poses de caméra et les effets. Une nouvelle analyse du composant `ProjectIndex` confirme maintenant la demande d’aperçu au survol, sa temporisation et la restauration de l’état précédent. Le focus clavier, la mise en valeur d’un seul panneau et le dialogue définis ici sont **notre adaptation**, à vérifier dans notre implémentation ; ils ne sont pas tous des comportements constatés chez Mirage.

### Composition à réaliser

```text
Navigation discrète sur fond presque noir

Selected projects                              Pause previews

          espace sombre / respiration
       panneaux vidéo répartis dans un paysage
           profond, bas, éclairé par endroits

01  Projet phare A          Featured    catégorie         ↗
──────────────────────────────────────────────────────────
02  Projet phare B          Featured    catégorie         ↗
──────────────────────────────────────────────────────────
03  Projet phare C          Featured    catégorie         ↗
──────────────────────────────────────────────────────────
04  Projet D                           catégorie         ↗
05  Projet E                           catégorie         ↗
06  Projet F                           catégorie         ↗
07  Projet G                           catégorie         ↗

Les lignes traversent le décor ; elles ne constituent pas
une seconde section placée entièrement après la scène.
```

Sur ordinateur, la vue d’ensemble doit montrer simultanément :

1. Les sept noms et leurs liens, sans interaction préalable.
2. Les sept panneaux du décor, chacun suffisamment exposé pour être distingué.
3. Trois panneaux plus présents et trois mentions `Featured`, sans rendre les quatre autres presque invisibles.
4. Un sol ou relief réellement lisible, des plans en profondeur et une lumière localisée.

La ressemblance recherchée repose sur cette composition, la matière et la lumière. Elle doit rester perceptible avec nos propres posters provisoires. Remplacer les posters par ceux de Mirage ne serait pas une correction de structure.

### Cibles de cadrage pour notre version

| Élément           | Cible initiale à 1440 × 900                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Fond              | Presque noir neutre, autour de `#050607`, avec un relief qui émerge localement                 |
| Marges latérales  | 32 à 48 px ; ne pas garder la galerie enfermée dans la largeur éditoriale actuelle             |
| Navigation        | Zone supérieure d’environ 80 à 96 px ; contraste clair adapté au thème sombre                  |
| Titre de section  | Sans empattements, environ 30 à 36 px, sans italique ; pas le grand titre Georgia actuel       |
| Décor             | Panneaux vers le tiers supérieur / milieu de l’écran ; relief étendu derrière plusieurs lignes |
| Début de la liste | Environ 285 à 310 px depuis le haut de la vue d’ensemble                                       |
| Lignes            | Environ 62 à 68 px ; titre de 17 à 20 px ; catégories de 11 à 13 px                            |
| Fin de la liste   | Septième ligne entièrement visible avant environ 800 px                                        |
| Lisibilité        | Texte clair ; ombrage local sous les lignes, sans rectangle opaque masquant tout le décor      |
| Hiérarchie        | Trois panneaux environ 1,25 à 1,4 fois plus grands ; même lisibilité des sept lignes           |

À 1280 × 800, réduire la respiration supérieure et les lignes vers 56 à 62 px pour garder les sept noms et liens dans le cadre. Ce sont des plages de réglage, pas une obligation de hauteur fixe. À zoom élevé ou lorsque le texte requiert davantage de place, laisser défiler plutôt que couper les noms.

Le titre principal de `/projects/` est un `h1`. Le titre de cette section sur `/` est un `h2`. Le premier écran d’Ing Tian conserve sa typographie à empattements : les styles sans empattements sont limités à la présentation Works.

## 3. Diagnostic précis du code actuel

| Code actuel                                                         | Pourquoi il produit une autre esthétique                                                     | Correction                                                                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ProjectGallery.astro`, `.gallery-grid` dans `home.css`             | Douze colonnes, cartes 3 + 4, titres sous les images                                         | Remplacer par une liste de lignes superposée à un décor spatial                                     |
| `ProjectList.astro` et `pages/projects/index.astro`                 | Grandes images et paragraphes sur fond ivoire                                                | Utiliser la présentation Works commune sur `/projects/`                                             |
| `renderer.ts`, `placeAtPixel()` et `anchor.getBoundingClientRect()` | Les sept objets suivent les rectangles de la grille ; la 3D reproduit son organisation plane | Donner aux panneaux des positions dans le monde 3D, indépendantes des lignes HTML                   |
| `renderer.ts`, `mesh.quaternion.copy(camera.quaternion)`            | Les panneaux regardent presque tous directement la caméra                                    | Orientations propres et profondeur visibles ; réserver l’alignement frontal à un aperçu éventuel    |
| `terrain.ts`                                                        | Nuage de points décoratif, sans surface recevant la lumière                                  | Garder les points du hero et ajouter une surface continue issue du même relief                      |
| `config.ts`                                                         | FOV de 38 à 48°, faibles inclinaisons, pas de pose dédiée à l’index                          | Introduire une pose Works et une disposition spatiale distinctes du hero                            |
| `renderer.ts`, matériaux et éclairage                               | Faces vidéo, cadres et lumières générales ; absence de halo diffusé sur le relief            | Ajouter matière du sol, contribution locale des panneaux et finition de l’image                     |
| `mount.ts`, `renderer.ts`, `media.ts`                               | Hypothèses globales sur la présence du hero, de la galerie et du dialogue                    | Paramétrer les éléments présents et le mode de page ; traiter explicitement les éléments optionnels |
| `BaseLayout.astro`, `global.css`                                    | Thème, navigation et pied de page pensés pour le fond clair                                  | Ajouter un thème Works limité aux pages/sections concernées                                         |

Références du rendu actuel à conserver pour la comparaison : [galerie du jalon 4](validation/jalon-4/gallery-1440x900.png) et [index du jalon 3](validation/jalon-3/index-1440x900.png). Elles documentent le point de départ, pas la cible corrigée.

## 4. Composants et architecture à modifier

### Présentation HTML commune

Créer `src/components/ProjectsShowcase.astro` et `src/components/ProjectRows.astro` — noms proposés pour clarifier les responsabilités.

- `ProjectsShowcase` reçoit les mêmes projets que l’accueil et l’index, le niveau de titre et le mode `home` ou `index`.
- `ProjectRows` rend une seule liste ordonnée de sept projets : numéro, lien du titre, mention `Featured` si nécessaire, une ou deux catégories courtes et un bouton d’aperçu distinct.
- Le titre est un vrai lien vers l’étude. Le bouton `Preview` ouvre le dialogue existant. Aucun bouton imbriqué dans un lien, aucun clic dépendant du canvas.
- Retirer de ces lignes les grandes images, résumés, contexte et rôle. Ces informations restent dans l’aperçu et les études.
- Garder un poster HTML ou une composition statique de secours pour le décor. Ne pas cacher les liens tant que le moteur n’est pas chargé.
- Si un nom abrégé est nécessaire, ajouter un champ facultatif `displayTitle` à la collection ; conserver `title` pour l’étude et utiliser `displayTitle ?? title` dans la liste. Ne pas tronquer silencieusement les noms.
- Les catégories viennent de la collection. Les filtres ne sont pas requis pour cette correction de sept projets ; si ajoutés ensuite, l’état initial montre tout et un retour explicite à l’ensemble est disponible.

`ProjectGallery.astro` peut devenir un wrapper du nouveau composant ou être remplacé dans `index.astro`. L’ancienne grille ne doit pas rester visible en parallèle. `ProjectList.astro` peut rester disponible pour un autre usage éditorial, mais ne doit plus rendre l’index principal.

### Instanciation sur les routes

| Route           | Assemblage attendu                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `/`             | Une seule `PortfolioScene` en mode `home`, `Hero`, transition, `ProjectsShowcase`, suite de l’accueil et un seul `ProjectPreview`        |
| `/projects/`    | Thème sombre, une seule `PortfolioScene` en mode `index`, `ProjectsShowcase` immédiatement en vue d’ensemble et un seul `ProjectPreview` |
| Études et About | Gabarits éditoriaux existants ; pas de chargement du moteur pour cette correction                                                        |

Conserver les liens natifs et le déploiement statique. La scène peut être reconstruite à chaque navigation de document ; la continuité de composition ne nécessite pas un canvas persistant entre toutes les routes. Un seul canvas par document suffit. Ne pas ajouter un routeur ou une bibliothèque de transitions simplement pour reproduire la stack Mirage.

### Contrat du moteur

Ajouter le mode `home | index` au composant et au montage, et fournir au moteur des références DOM explicites : racine de scène, section Works, hero facultatif, dialogue et son emplacement média. Éviter les sélecteurs globaux suivis de `!` pour des éléments qui n’existent pas sur l’index.

Le mode `index` commence directement en `overview`. Il ne doit pas accéder à `hero.getBoundingClientRect()`, ni attendre de franchir un seuil de défilement prévu pour l’accueil.

Séparer deux notions :

- **L’état du parcours** : `hero`, `reveal`, `overview`, `selected`, `fallback`.
- **Le projet mis en valeur** : `activeProjectId`, facultatif, piloté par survol ou focus sans quitter `overview`.

Cette séparation évite qu’un simple survol ouvre un dialogue, masque les autres projets ou crée une entrée d’historique. Le mode et l’état doivent être conservés lors d’un redimensionnement, d’une reprise depuis le cache navigateur et d’un changement de préférence de mouvement.

## 5. Scène 3D : modifications indispensables

### Disposition dans l’espace

Créer un module `src/scene/layout.ts` qui calcule les positions, rotations et dimensions des sept panneaux à partir des identifiants stables et du champ de vision. Cette disposition doit être déterministe et indépendante des rectangles des lignes HTML.

Utiliser un **arc ouvert face au visiteur**, ou une disposition légèrement décalée en profondeur. Les panneaux peuvent avoir des hauteurs et orientations différentes. Les trois phares occupent des positions plus présentes ; les quatre autres gardent une surface visible suffisante. Aucun projet n’est placé derrière la caméra ou entièrement caché par un autre.

Vérifier les rectangles projetés à l’écran pour le cadrage et les recouvrements. À 1440 × 900, viser au moins 90 px de largeur projetée pour un secondaire et au moins 70 % de sa face exposée ; agrandir davantage les phares. Ces seuils sont des garde-fous proposés pour notre version et doivent être accompagnés d’une vérification visuelle.

Ne pas attacher une carte 3D à chaque ligne HTML. La liaison entre les deux couches passe par l’identifiant du projet et l’état de mise en valeur. Conserver `placeAtPixel()` seulement là où il reste utile, par exemple pour rejoindre le cadre du dialogue d’aperçu.

### Caméra

La fiche REA confirme une perspective de 15° chez Mirage et une pose `pIndex` spécifique. Dans notre scène, commencer les essais Works entre 15° et 20°, puis adapter recul, cible et dimensions du décor ensemble. Copier seulement le FOV dans la scène actuelle provoquerait un cadrage incorrect.

La pose Works vise un relief bas et une exposition de panneaux au milieu du cadre. Le fond reste profond et sombre. Conserver les réglages du premier écran de l’accueil, puis interpoler vers la nouvelle pose Works. À l’ouverture directe de `/projects/`, appliquer la pose finale sans rejouer l’introduction.

Pour l’entrée depuis l’accueil, normaliser une progression de 0 à 1 à partir de la position de la section :

| Progression indicative | Effet proposé                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| 0–0,35                 | Le paysage de points reste visible ; le fond devient progressivement sombre               |
| 0,2–0,7                | Une surface issue du même relief devient perceptible ; la caméra rejoint le cadrage Works |
| 0,35–0,9               | Les sept panneaux apparaissent avec un léger décalage temporel                            |
| 0,7–1                  | La liste et l’éclairage atteignent leur état stable                                       |

Les plages se chevauchent pour former un seul mouvement. La séquence est réversible au défilement. Le contenu HTML demeure disponible dès le rendu initial, notamment sans JavaScript. Retirer ou intégrer la bande `.atmosphere` actuelle si elle crée une coupure visible entre les deux univers.

### Relief et lumière

Extraire le calcul des hauteurs de `terrain.ts` dans une fonction commune. Elle sert au nuage de points du hero et à un maillage de sol, avec normales calculées, pour Works. Il peut s’agir de deux objets coordonnés dans la même scène ; leur fondu assure la continuité, sans exiger un morphing complexe dès cette correction.

Le sol reçoit une matière sombre, des variations de normales/relief, un grain fin et des plages lumineuses localisées au pied des panneaux. Une vidéo appliquée à une `MeshBasicMaterial` ne projette pas à elle seule sa lumière sur le sol.

Créer par exemple `src/scene/ground.ts` et `src/scene/lighting.ts`. Une implémentation possible est un shader de sol qui additionne, pour chaque panneau, une couleur et une atténuation selon sa position et la distance. Commencer par les accents existants, puis employer les courbes de couleurs des trois vidéos pour faire évoluer les halos. Les couleurs fixes de secours restent disponibles sans vidéo.

Préparer les courbes hors ligne pour nos propres médias ; un petit JSON local suffit. Éviter une extraction de pixels à chaque frame dans le navigateur. Interpoler les couleurs dans le temps et synchroniser avec `video.currentTime`. Les couleurs hexadécimales/sRGB, leur conversion en espace linéaire pour l’éclairage et la conversion de sortie doivent rester cohérentes.

Ajouter un bloom discret et un vignettage contrôlé dans un module `postprocessing.ts`. Ne pas faire subir les effets au texte HTML. Vérifier les halos sur fond noir sans brûler les vidéos ni rendre le sol gris uniforme. Le renderer doit rendre la scène à travers la chaîne d’effets lorsqu’elle est active, et libérer ses render targets au démontage.

Le relief visible, les halos localisés et la finition lumineuse font partie du résultat attendu. La distorsion de chaleur et le fluide au pointeur peuvent venir ensuite : ils ne compensent pas une composition plane ou une scène trop sombre pour être perçue.

## 6. Interactions, vidéos et adaptation aux écrans

### Liste et mise en valeur

- Au repos, les sept projets restent exposés ; aucun carrousel automatique ne remplace la vue d’ensemble.
- Survol d’une ligne ou focus clavier de son lien/bouton : souligner la ligne, renforcer légèrement le panneau correspondant et son halo. Les autres restent visibles.
- Ajouter un éclat doux sur les séparateurs proches du pointeur, avec un gradient radial masqué sur leurs traits, inspiré du composant `ProjectIndex-glow` de Mirage. Le focus clavier produit un état visuel équivalent sans dépendre de coordonnées de souris. Garder le contraste des noms des lignes voisines.
- Le focus clavier a priorité sur le survol. À la sortie du groupe, revenir doucement à l’ambiance d’ensemble.
- Viser une transition d’accentuation de 200 à 350 ms, sans déplacement important de caméra à chaque survol.
- Le lien du titre ouvre directement l’étude. `Preview` est une commande séparée, accessible au clavier et au toucher ; elle conserve le dialogue, Échap et le retour déjà fonctionnels.
- Seule l’ouverture explicite du dialogue peut masquer l’ensemble derrière l’aperçu. La fermeture retrouve la même disposition, le même défilement et le bon focus.

### Adapter `media.ts` plutôt que le recopier tel quel

Le gestionnaire actuel déduit l’éligibilité de la visibilité des parents HTML des vidéos et du dialogue. Avec des panneaux indépendants du DOM, cette règle ne représente plus leur présence réelle à l’écran.

Lui fournir la visibilité de la section/scène et, si nécessaire, celle des panneaux projetés. Des vidéos sources cachées dans un conteneur technique ne doivent pas être toutes considérées comme hors champ. Séparer la priorité du projet survolé/focalisé de la sélection modale : **ne pas appeler l’actuel `select()` au simple survol**, car il déplace la vidéo dans le dialogue.

Conserver deux lectures simultanées au maximum sur ordinateur, une en configuration contrainte, la pause manuelle, l’arrêt en onglet masqué et le poster en cas d’échec. Donner priorité au projet actif après un court délai, en commençant par les **120 ms retrouvées dans `ProjectIndex` chez Mirage**, pour éviter les relances lors du passage rapide sur les lignes. Ce délai appartient à la demande d’aperçu de la liste ; les 600 ms documentées auparavant concernent un autre abonnement du carrousel. Les autres panneaux affichent au minimum leur poster ; les sept n’ont pas besoin de sept vidéos simultanées.

Lors d’une sélection, la vidéo et le canvas peuvent continuer à rejoindre le dialogue comme aujourd’hui. Leur retour doit restaurer le mode Works et la bonne gestion de visibilité. Regrouper les médias par identifiant pour éviter les lecteurs dupliqués.

### Mobile, petits écrans et préférences

À 768 × 1024, essayer une version allégée du même décor et conserver la liste. À 390 × 844, privilégier le nom du projet, son lien et une catégorie courte ; laisser défiler les sept lignes. Tous les projets sont présents par défaut, même lorsqu’ils ne tiennent pas simultanément dans le viewport mobile.

Ne pas transformer automatiquement Works en ancienne grille de cartes sous 1100 × 800. Adapter le cadrage, la résolution et les effets ; si la 3D doit être désactivée, conserver une composition statique sombre représentant notre propre exposition et la liste HTML.

Avec mouvement réduit : décor fixe, aucune vidéo automatique ni déplacement de caméra imposé. Sans WebGL, avec perte de contexte ou sans JavaScript : sept liens fonctionnels, même hiérarchie, poster/composition de secours et accès aux études. Le fallback n’est pas une page blanche ni une redirection.

Pour le rendu animé, viser 60 images/s sur la machine de référence et documenter les mesures réelles. Un DPR plafonné autour de 1,3 est un point de départ, pas une performance garantie. Réduire d’abord la résolution et les effets coûteux ; ne pas supprimer des projets. Éviter les ombres dynamiques multiples si le shader de sol fournit déjà l’effet souhaité.

Les effets temporels demandent des frames tant qu’ils sont actifs et visibles. Ne pas conserver la promesse « aucun RAF au repos » tout en animant un shader en permanence. Avec médias et effets temporels en pause, arrêter le rendu après stabilisation des transitions ; en onglet masqué, l’arrêter dans tous les cas.

## 7. Carte des fichiers pour l’agent codeur

| Fichier ou groupe                                                                | Intervention attendue                                                                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/pages/index.astro`                                                          | Remplacer l’ancienne galerie par la présentation commune ; conserver le hero                                 |
| `src/pages/projects/index.astro`                                                 | Entrée directe sur Works avec scène et aperçu ; retirer le grand en-tête éditorial actuel                    |
| `src/components/ProjectsShowcase.astro`, `ProjectRows.astro`                     | Nouveaux composants communs et liste accessible                                                              |
| `src/components/ProjectGallery.astro`, `ProjectList.astro`                       | Remplacer leur rôle sur les deux entrées ; retirer les usages/styles devenus inutiles                        |
| `src/components/PortfolioScene.astro`                                            | Mode explicite et données sérialisées ; un seul montage par page                                             |
| `src/components/ProjectPreview.astro`, `src/scene/selection.ts`                  | Conserver le parcours éprouvé ; adapter aux nouveaux déclencheurs et au retour à Works                       |
| `src/layouts/BaseLayout.astro`, `SiteHeader.astro`, `SiteFooter.astro`           | Thème sombre approprié à `/projects/`, sans modifier globalement les pages éditoriales                       |
| `src/styles/works.css`                                                           | Nouveau style partagé : composition, lignes, couches, états, responsive                                      |
| `src/styles/home.css`, `global.css`, `tokens.css`                                | Retirer la grille du parcours Works ; isoler styles du hero et du dialogue ; ajouter des tokens Works        |
| `src/scene/types.ts`, `config.ts`, `mount.ts`                                    | Mode de page, pose Works, projet actif et références DOM explicites                                          |
| `src/scene/renderer.ts`, `layout.ts`                                             | Positions dans le monde, cadrage, profondeur, états et chaîne de rendu                                       |
| `src/scene/terrain.ts`, `ground.ts`, `lighting.ts`, `postprocessing.ts`          | Relief commun, surface, halos, couleurs, finition et libération GPU                                          |
| `src/scene/media.ts`                                                             | Éligibilité spatiale, priorité au focus/survol, budgets et sélection modale                                  |
| `src/content.config.ts`, `src/lib/projects.ts`                                   | Éventuel `displayTitle`, métadonnées utiles à la scène ; conserver sept projets / trois phares et leurs URLs |
| `public/media/`, éventuel générateur dans `scripts/`                             | Composition de secours, courbes de couleurs et médias locaux remplaçables                                    |
| Scripts de contrôle navigateur                                                   | Adapter les sélecteurs et scénarios à la nouvelle présentation ; ajouter l’entrée directe `/projects/`       |
| `docs/ARCHITECTURE.md`, `src/scene/README.md`, `README.md`, `docs/MILESTONES.md` | Décrire la réalisation finale et lever les affirmations devenues fausses sur une scène limitée à l’accueil   |

Les noms des nouveaux modules sont proposés ; ajuster leur découpage si cela simplifie le code sans perdre ces responsabilités. Réutiliser les dépendances installées et les modules Three.js adaptés. GSAP/Lenis sont des options d’implémentation, pas une condition de ressemblance. Ne pas changer la version du framework ou du moteur sans nécessité identifiée.

## 8. Ordre de réalisation et conditions de livraison

### A — Composition commune

Construire les lignes et le thème Works sur les deux routes, avec un fond provisoire cohérent. Vérifier le cadrage des sept lignes à 1440 × 900 et 1280 × 800. Garder les liens et aperçus utilisables. Ce premier passage établit la composition, mais ne clôt pas la correction 3D.

### B — Espace, matière et lumière

Découpler les panneaux de l’ancienne grille, ajouter la pose Works, le sol et les halos, puis la finition lumineuse. Comparer le rendu à la référence avant d’accumuler de petits effets. Les sept panneaux doivent déjà former une exposition crédible, avec des orientations et des distances perceptibles.

### C — Continuité et interactions

Relier les points du hero à ce décor, ajouter l’accentuation au focus/survol et adapter les vidéos. Vérifier l’entrée directe dans l’index, la sélection, les retours et les replis. Finaliser les couleurs synchronisées des vidéos phares avec un comportement de secours fixe.

### D — Recette technique et visuelle

Exécuter `npm run verify` et les contrôles navigateur adaptés. Les scripts existants dépendent notamment de `.gallery-grid`, `[data-panel]` et des anciennes dimensions. Modifier leurs assertions selon le nouveau contrat ; ne pas supprimer la couverture des sept projets, du clavier et des erreurs pour les faire passer.

Les études restent sans canvas ; `/projects/` possède désormais une scène. Relire les assertions existantes route par route. Tester l’absence de doubles canvases, les navigations répétées, les chargements tardifs et le démontage des nouveaux shaders/render targets.

**Un build réussi ne valide pas la ressemblance.** Conserver dans `docs/validation/mirage-correction/` :

- captures de Mirage `/works` et de notre `/projects/` au même viewport 1440 × 900, à un état stabilisé, avec date d’observation ;
- comparaison côte à côte, fond, cadrage, relief, panneaux, lignes, typographie et lumière explicitement commentés ;
- captures de notre vue d’ensemble à 1280 × 800, 768 × 1024 et 390 × 844 ;
- captures du hero conservé, de la transition intermédiaire et de la section Works sur `/` ;
- capture d’un projet phare et d’un secondaire mis en valeur, plus un aperçu ouvert ;
- capture des replis et un compte rendu des parcours, performances mesurées et limites restantes.

Comparer les structures et les effets de notre composition, pas les pixels des films clients de Mirage. Les trois principaux ont plus de présence, mais les quatre autres restent faciles à identifier. Lorsque l’outil le permet, une courte capture vidéo complète les images pour les mouvements ; à défaut, conserver plusieurs états et décrire le parcours réellement testé.

| Critère d’acceptation       | Vérification attendue                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Ressemblance de composition | Liste fine sur décor profond presque noir ; absence de l’ancienne grille 3 + 4                                                    |
| Sept projets                | Sept titres et liens dans le cadre de référence sur ordinateur, sept panneaux discernables ; ordre stable                         |
| Trois phares                | Mise en valeur par échelle, placement et mention, sans cacher les quatre autres                                                   |
| Matière                     | Surface du relief visible, lumière locale, panneaux orientés et sensation d’échelle ; pas seulement des points sous des vignettes |
| Deux entrées                | Même présentation sur la section de `/` et sur `/projects/`, y compris après rechargement direct                                  |
| Interaction                 | Survol et focus mettent en valeur sans modal ni changement d’historique ; clic du titre ouvre l’étude                             |
| Aperçu                      | Ouverture explicite, Échap, restauration du focus, Retour/Avancer et retour depuis une étude                                      |
| Mobile et zoom              | Pas de débordement horizontal ni de texte coupé ; aucun projet réservé au survol                                                  |
| Replis                      | Liens disponibles sans JS/WebGL et avec mouvement réduit ; décor statique cohérent                                                |
| Médias et GPU               | Budgets respectés, erreurs absorbées, pause hors champ et en onglet masqué, ressources libérées                                   |
| Livraison                   | Captures comparatives et écarts restants exposés ; les seules recettes anciennes ne suffisent pas                                 |

Le déploiement reste celui de GitHub Pages déjà prévu. Ce document n’ajoute ni publication automatique ni nouveau service externe. Terminer d’abord la correction locale et sa recette ; rapporter séparément l’état de publication.

## 9. Sources et limites de l’analyse

- [Référence visuelle : Studio Mirage Works](https://studiomirage.io/works), revue le 14 octobre 2026.
- [Observation de l’accueil, de Works et d’une étude](references/STUDIO_MIRAGE.md).
- [Panneaux, caméra, shader de sol, vidéos et post-traitement](references/STUDIO_MIRAGE_3D.md).
- [REA approfondie et limites des graphes/captures](references/STUDIO_MIRAGE_REA_DEEP.md).
- [Architecture actuelle avant correction](ARCHITECTURE.md) et [recette du jalon 4](validation/jalon-4/README.md).

La stack Mirage relevée est SvelteKit/Threlte, Three.js r182, GSAP 3.14.2 et Lenis 1.3.17. Notre correction utilise Astro/TypeScript/Three.js : le rendu dépend des géométries, matériaux, shaders, cadrages et interactions à reconstruire, pas du seul choix des bibliothèques.

REA a aidé à analyser les modules publics et leurs relations. La compréhension visuelle résulte aussi de l’observation et de la lecture manuelle du code. Les graphes restent partiels pour certains gros modules et la capture approfondie portait sur l’accueil pendant son chargement. Aucun backend privé ni projet source complet de Mirage n’a été récupéré. Les paramètres de notre adaptation devront donc être réglés et vérifiés en navigateur ; ils ne sont pas présentés ici comme une copie garantie par l’analyse.

## 10. Comment Mirage construit ce frontend : preuves REA et traduction

### Nouvelle vérification ciblée sur Works

Le HTML public de `/works`, téléchargé le 14 octobre, déclare les nœuds SvelteKit `[0, 3]`. Le nœud `3.BgKeXjxy.js` charge le moteur de sections depuis `DO3l11rT.js`. Dans ce module, `project_index` est associé au composant `ro`, qui construit `ProjectIndex`.

Une passe REA 6.4.0 a parcouru ces deux fichiers : **87 405 octets, 30 310 nœuds AST et aucune erreur de parsing**. Le graphe du gros module partagé a été écarté du résultat pour une limite de budget. Une seconde passe a donc isolé ses imports, la déclaration des templates de la liste et la fonction `ro`, sans renommer ni réécrire leur contenu : **8 255 octets, 2 398 nœuds sémantiques et 2 568 relations, sans troncature de ressources**. Son statut de couverture reste `unknown`, notamment pour les appels externes et dynamiques.

REA conserve dans cet extrait les appels du gestionnaire de survol vers `w`, du gestionnaire de sélection mobile vers `w`, et de `te` vers `q` pour la restauration. La lecture des fonctions donne ensuite leur signification. Il s’agit de liens statiques, pas de traces prouvant chaque interaction en exécution.

Les [preuves compactes de cette nouvelle passe](references/evidence/MIRAGE_WORKS_REA_EVIDENCE.json) conservent les SHA-256, intervalles de source, trois relations sélectionnées remappées vers le module original, paramètres et limites. Les rapports complets et sources temporaires sont sous `/private/tmp/portfolio-mirage-correction-20261014/` ; le document et le JSON restent exploitables s’ils sont supprimés.

### Mécanismes vérifiés et correctifs correspondants

| Repère réel dans le code Mirage              | Ce qu’il fait                                                                                                                                                          | Traduction dans notre correction                                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ro` / `ProjectIndex`, dans `DO3l11rT.js`    | Rend la liste et lui attribue `data-gl-state="pIndex"`, avec une anticipation `data-gl-lead` de 0,4                                                                    | Relier la section à une pose Works explicite ; faire coexister scène et liste                                                   |
| `ro` → `w`                                   | Au survol ordinateur, attend 120 ms puis transmet identifiant, médias desktop/mobile et `forcePreview` au store partagé                                                | Mettre en valeur le projet et donner priorité à son média ; état séparé du dialogue                                             |
| `te` → `q`                                   | À la sortie de la liste, annule le délai et restaure les états mémorisés si l’aperçu courant lui appartient encore                                                     | Gérer l’annulation, les passages rapides et la priorité du focus ; ne pas écraser un état plus récent                           |
| `Hu.pIndex`, dans `iTEJ16On.js`              | Pose desktop : cible `[0, 0.1, 0]`, rayon 21, inclinaison 1,434 rad ; angle horizontal non imposé. Variante mobile : cible `[0, -1, 0]`, rayon 17,2, inclinaison 1,392 | Partir d’un cadrage éloigné et bas, puis l’adapter à nos sept panneaux. `null` signifie conserver l’angle, pas le forcer à zéro |
| `Vc`, `Yc`, `au`, dans `0.BjG-yHQV.js`       | Boîtes fines instanciées, indice vidéo par instance, positions sur un cercle et rotation du groupe                                                                     | Partager géométrie/matériaux autant que possible ; remplacer le cercle fermé par une exposition ouverte                         |
| `Gc`, `zc`, store `Bt`, shader créé par `lu` | Transmet les plages de la texture de couleurs et les fractions de lecture des vidéos au sol                                                                            | Préparer nos courbes de couleurs et les synchroniser ; utiliser les accents comme secours                                       |
| `lu` et `uu`                                 | Sol maillé, texture de normales, atténuation spatiale de contributions colorées, grain et scintillements                                                               | Ajouter une matière et des halos au relief mathématique ; le nuage de points seul est insuffisant                               |
| `Ww`, `I_`, `Ow`                             | Repères HTML recalculés, progression entre poses, courbes distinctes pour pose et fondus                                                                               | Garder un pilote de progression commun avec des courbes séparées pour points, sol, panneaux et lumière                          |
| `hu`, `hr`, `gu`                             | Couche de plans alignés au DOM sous caméra orthographique, distincte de la scène perspective                                                                           | Utiliser l’alignement DOM pour des médias associés à une mise en page ou un aperçu, pas comme disposition de toute l’exposition |
| `sf`, `vf`, `hf`                             | Composition des effets, résolution adaptative et rythme de rendu                                                                                                       | Modules séparés, qualité mesurée, textes hors des effets et nettoyage complet                                                   |

La lumière du sol utilise une couleur échantillonnée dans la plage propre à chaque vidéo, pondérée par une distribution spatiale et l’orientation des normales. Elle additionne les contributions des dix panneaux d’origine. Ce mécanisme doit être adapté à **sept** contributions ou à une capacité explicite ; ne pas conserver des tableaux, boucles ou angles codés pour dix projets. Une vraie simulation de lumière indirecte n’est pas nécessaire pour obtenir cet effet.

La chaîne fonctionnelle à reproduire est donc :

```text
Section HTML → progression → pose et paramètres de scène
Ligne survolée / focalisée → identifiant actif → priorité vidéo
Temps de la vidéo → couleur interpolée → lumière locale du sol
Scène perspective → effets d’image → canvas derrière la liste HTML
```

### Détails CSS effectivement lus sur Works

Dans `index.C2UlERh3.css`, la liste occupe toute la largeur, avec un titre de `2rem`, des liens espacés verticalement de 22 px, des séparateurs blancs à 10 % d’opacité et une couche d’éclat limitée aux traits par un masque. Au survol, le code ajoute un fond translucide et un flou d’arrière-plan de 8 px. Ces effets CSS sont distincts des shaders du sol.

Ces valeurs expliquent la finesse des lignes. Les adapter à notre densité de sept projets, en gardant du texte lisible. Les variables globales, le contenu et les breakpoints participent au résultat : 22 px de padding ne prouvent pas à eux seuls une hauteur finale de ligne.

### Écarts conservés volontairement pour Emeryc

Le frontend Mirage demande un aperçu à la scène partagée. Sa couche de panneaux dispose d’une texture d’aperçu commune ; notre mise en valeur doit conserver les sept identités distinctes dans la vue d’ensemble. Le remplacement global par un seul projet peut rester réservé à un aperçu explicitement ouvert.

Le code mobile de Mirage utilise aussi une liste en roue, avec perspective CSS, masques et sélection centrée. Nous conservons une liste mobile ordinaire qui laisse découvrir tous les projets dans le défilement, conformément à la demande de visibilité. Les transitions au focus clavier sont également une exigence de notre version, pas une propriété déduite des seuls gestionnaires `mouseenter` de Mirage.

### Accès aux sources publiques relues

- [Nœud SvelteKit chargé par Works](https://studiomirage.io/_app/immutable/nodes/3.BgKeXjxy.js).
- [Composants de sections, dont ProjectIndex](https://studiomirage.io/_app/immutable/chunks/DO3l11rT.js).
- [Styles de ProjectIndex](https://studiomirage.io/_app/immutable/assets/index.C2UlERh3.css).
- [Moteur de scène, panneaux, sol et effets](https://studiomirage.io/_app/immutable/nodes/0.BjG-yHQV.js).
- [États et poses de scène](https://studiomirage.io/_app/immutable/chunks/iTEJ16On.js).

Les noms minifiés et URL correspondent à la version observée. Ils servent à retrouver les mécanismes, pas à importer ces scripts dans notre site. Reconstruire les composants et shaders pour nos données ; ne pas dépendre des médias ou du déploiement de Mirage.
