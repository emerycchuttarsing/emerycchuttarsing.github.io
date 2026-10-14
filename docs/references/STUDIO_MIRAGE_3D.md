# Studio Mirage — mécanismes de la galerie 3D

Étude complémentaire du 13 octobre 2026 (PDT ; 14 octobre UTC).
Sources publiques téléchargées comme données, lues et analysées avec REA 6.4.0.
Cette fiche complète les [observations visuelles](STUDIO_MIRAGE.md).
Elle intègre la [nouvelle analyse REA ciblée](STUDIO_MIRAGE_REA_DEEP.md) : huit
passes supplémentaires et une première capture CDP légère réussie.

## Résultat de l'accès aux modules

Le blocage initial n'est plus actuel : les 18 modules JavaScript suivis, le modèle
GLB et le manifeste de couleurs ont tous répondu HTTP 200. Le nouveau téléchargement
utilisait un User-Agent et un Referer explicites. La cause exacte des anciens 403
n'a pas été isolée ; aucun compte ni accès privé n'a été nécessaire.

La première passe REA a parcouru 18 fichiers, 1 187 388 octets, 308 222 nœuds AST, avec 0 erreur de
parsing et 777 constats statiques. Le graphe applicatif comporte 169 nœuds et
816 relations. Son graphe sémantique reste partiel : certains gros fichiers ont
atteint les budgets de mémoire ou de sortie. Les chiffres ne prouvent ni une
couverture exhaustive ni l'exécution de toutes les branches.

Les explications ci-dessous proviennent de la lecture du code, des relations
d'import et des métadonnées du modèle, rapprochées du parcours déjà observé.
La nouvelle capture REA confirme la structure de l'accueil pendant son chargement
(un canvas, dix vidéos et les liens des projets). Le parcours interactif complet
et les performances restent non mesurés. Les nouveaux graphes et leurs limites
sont détaillés dans la fiche complémentaire.

## Décomposition confirmée

| Élément | Mécanisme confirmé | Intérêt pour notre portfolio |
| --- | --- | --- |
| Moteur | Three.js révision 182, composants Threlte, interface SvelteKit | Une véritable scène avec caméra, géométrie, textures et shaders |
| Animation | GSAP 3.14.2, interpolations par image, défilement Lenis 1.3.17 | Coordonner caméra, apparitions, couleurs et changements de page |
| Panneaux | Dix boîtes minces instanciées ; une face vidéo et les autres sombres | Réutiliser une même géométrie pour les aperçus des projets |
| Disposition | Dix positions régulièrement espacées sur un cercle | Organisation à adapter pour rendre nos sept projets visibles ensemble |
| Sol | Un seul maillage chargé depuis un GLB compressé Draco | Le décor peut être remplacé par notre paysage mathématique |
| Matière du sol | Shader spécifique : normales, couleur du relief, grain et scintillements | Donner une présence matérielle aux points et aux surfaces |
| Lumière | Couleurs temporelles pré-calculées, synchronisées avec chaque vidéo | Faire varier l'ambiance avec les aperçus des projets |
| Caméra | Perspective étroite, rapprochement au défilement, poses selon la page et sa section | Passer de l'accueil à la vue d'ensemble puis au projet choisi |
| Finition de l'image | Halo lumineux, vignettage, ondulation de chaleur, déformation fluide au pointeur, anticrénelage | Choisir les effets qui renforcent la présentation et la lisibilité |

## 1. Géométrie et panneaux

Le fichier `Mirage_scene_03.Cdl4Dhyd.glb` fait **45 740 octets**. Son en-tête
indique un export Blender glTF 2.0 avec compression Draco. Il contient une scène,
un nœud nommé `ground` et un maillage : 11 772 sommets déclarés, 69 336 indices,
soit 23 112 triangles. Il ne déclare ni caméra, ni animation, ni matériau.
Ce poids concerne uniquement le modèle du sol, pas l'ensemble du site.

Les panneaux sont construits par le programme. La géométrie de base est une boîte
de **1,61 × 0,98 × 0,05 unités**. Une face reçoit le média ; les autres sont
rendues sombres. Dix instances partagent cette géométrie. Leur position suit
un cercle de rayon **2,59**, à une hauteur **0,38** ; leur orientation suit le cercle.

Le shader adapte aussi la largeur des panneaux de 0,5 à 1 fois leur largeur de
base selon l'angle de caméra, avec adaptation coordonnée des UV de la vidéo.
La rotation du groupe est interpolée et s'arrête sur des incréments de 36°.
Le défilement passe d'une phase `cameraMove` à une phase `carouselRotate`.

Les images d'attente sont prévues à 512 px de largeur. Les vidéos sont chargées
en textures Three.js ; leurs mises à jour suivent `requestVideoFrameCallback`.
Une texture d'aperçu commune peut se substituer progressivement à celles du
carrousel pour présenter un projet choisi. Le code gère saturation, fondu noir
et bruit de type téléviseur selon l'état de la scène.

## 2. Caméra et continuité entre les pages

La caméra perspective utilise un champ de vision de **15°**. Sur ordinateur,
l'entrée depuis l'accueil interpole un rayon de **30 vers 10 unités**, une
inclinaison allant vers **0,315π**, et un décalage vertical allant vers **−4,9**.
Un faible déplacement du pointeur modifie les angles ; les interpolations
principales de cette entrée utilisent un coefficient de 0,1 par image.

Les réglages mobiles de cette entrée sont distincts : rayon **56 vers 11**,
décalage vertical vers **−5,2**, modulation au pointeur nulle. Ce sont des
paramètres du code, pas une mesure de confort sur téléphone.

Les pages utilisent des états nommés, dont `top`, `carousel`, `pIndex`,
`usecaseHero`, `lightsOff`, `footer` et `nextPage`. Les sections HTML possèdent
des repères qui pilotent l'interpolation de pose et d'ambiance. Par exemple,
les valeurs de base sur ordinateur placent `carousel` à un rayon 7,2 et `pIndex`
à un rayon 21, avec une inclinaison 1,434 rad. La liste des travaux conserve
ainsi la même scène avec une autre mise en place.

Les ajustements mobiles ne sont pas une simple réduction uniforme :

| État | Rayon ordinateur | Rayon mobile | Autre ajustement mobile |
| --- | ---: | ---: | --- |
| `top` | 34 | 49 | Paramètres restants hérités |
| `carousel` | 7,2 | 8,2 | Cible `[0, −0,15, 0]` |
| `pIndex` | 21 | 17,2 | Cible `[0, −1, 0]`, inclinaison 1,392 rad |
| `lightsOff` | 10 | 28,9 | Paramètres restants hérités |
| `footer` | 21 | 34 | Angle horizontal laissé non imposé (`null`) |

Ces états de section se distinguent de la trajectoire d'entrée décrite plus haut.
Ils montrent l'intérêt de définir nos propres poses pour ordinateur et téléphone.

La scène 3D et certains éléments liés au DOM sont composés dans un canvas
unifié. Cela explique la continuité perçue dans le parcours observé. Les
transitions déclenchent également des fondus et une intensification de la
distorsion via GSAP ; tout le mouvement ne dépend pas de GSAP.

## 3. Lumière synchronisée : le mécanisme à retenir

Le manifeste public `color-timelines.json` décrit **13 vidéos**, dont dix pour
le carrousel, **755 échantillons temporels**, une fréquence annoncée de **15 Hz**
et une texture de **1 × 755 pixels**. Les identifiants, plages et durées relient
chaque projet à ses couleurs. Le fichier a une date de génération déclarée du
4 septembre 2026.

Le navigateur charge les couleurs compactées dans une texture. À partir de la
position de lecture de chaque vidéo, le shader du sol échantillonne sa couleur
correspondante et calcule l'étendue de son éclairage au pied du panneau. Il
combine dix contributions et tient compte de la rotation du groupe.

Il s'agit d'une simulation visuelle spécifique : la propagation est calculée
dans le shader à partir de la distance et de l'angle au panneau. Le code lu
n'effectue pas un calcul physique complet de lumière indirecte pour cet effet.
Le procédé original d'extraction des couleurs hors ligne n'a pas été retrouvé.

Quand un projet est choisi, un mode commun peut appliquer les couleurs de sa
vidéo à l'ensemble. Relief, saturation, grain et scintillements viennent ensuite
enrichir le résultat. C'est une piste forte pour nous : les trajectoires du
capstone, les surfaces de couverture et les liens du système de recommandation
pourraient chacun donner une ambiance au paysage partagé.

## 4. Effets et adaptation de la qualité

La chaîne active comprend un halo lumineux (bloom), un vignettage, un shader
de chaleur `MirageEffect`, un effet fluide au pointeur sur les appareils non
tactiles, puis l'anticrénelage SMAA. Les transitions et la vitesse du défilement
modulent la distorsion. Ce sont des effets superposés au rendu de la scène.

Le code limite le ratio de pixels à 1,3, prévoit des paliers de résolution
1 / 0,88 / 0,76 et une régulation de cadence visant environ 60 images/s. Ces
valeurs sont des intentions du programme, pas des performances mesurées.
Les appareils tactiles désactivent les scintillements du sol et l'application
de la déformation fluide ; des variantes vidéo mobiles sont utilisées aussi
sur Safari. Une perte de WebGL provoque une redirection vers la page About.

Notre version devra garder les projets directement disponibles en cas de
réduction du mouvement ou d'indisponibilité du rendu 3D. Le comportement exact
sur téléphone et le poids total des médias devront être mesurés lors des essais.

## 5. Lecture vidéo, cache et nettoyage — nouveaux détails

La fonction `eu` du module principal distribue la lecture entre les vidéos.
En mode automatique, elle autorise **deux lectures sur Safari, quatre ailleurs**,
choisit aléatoirement parmi les vidéos en pause et les fait tourner par plages de
**2 à 5 secondes**. Le plafond dépend de Safari, pas simplement du format mobile.
Trois échecs successifs suspendent les tentatives automatiques ; des événements
tactiles et de clic permettent une nouvelle tentative. Les nouveaux démarrages
sont suspendus lorsque le document est masqué.

Dans la phase `carouselRotate`, l'ordonnanceur passe en mode manuel : la vidéo
sélectionnée joue en boucle et les autres sont mises en pause. Le changement
issu de l'abonnement au projet actif est temporisé de **600 ms**. Il s'agit de
logique lue dans le code, pas de lectures mesurées dans la capture runtime.

La sélection réutilise la vidéo du carrousel lorsqu'elle existe déjà. Pour un
aperçu externe à ce carrousel, un cache de **trois entrées** conserve vidéo et
texture. `Oi` renouvelle leur ordre d'utilisation ; `qt` détruit la texture,
met la vidéo en pause, enlève sa source et appelle `load()` lors de l'éviction.
Ce cache de trois ne limite pas le nombre de panneaux ni celui de toutes les vidéos.

Les images d'attente restent utilisées avant la première image vidéo. Les
callbacks vidéo mettent les textures à jour quand de nouvelles images arrivent.
Les chemins de destruction libèrent également les géométries et textures,
annulent les callbacks et retirent les abonnements.

**Pour nos sept projets :** conserver sept panneaux présents et sélectionnables,
avec des images d'attente soignées et un petit budget d'animations simultanées.
Le panneau choisi reçoit la priorité. Le nombre exact de lectures sera testé ;
les trois projets phares restent distingués par leur composition et leur taille.

## 6. Sections HTML et chorégraphie de la scène — nouveaux détails

Dans `iTEJ16On.js`, `Ww` recense les éléments portant `data-gl-state`. Il lit aussi
`data-gl-immediate`, `data-project-id` et un éventuel `data-gl-lead`. `I_` calcule
les positions de repère dans le document, avec un traitement des sections fixes
dans un `pin-spacer`. Les repères sont triés dans l'ordre du défilement.
Un MutationObserver suit les ajouts/retraits ; un ResizeObserver déclenche leur
recalcul lorsque le contenu change de dimensions. Une méthode `stop()` retire
ces observateurs et vide les repères.

`Ow` interpole entre deux états successifs. La pose et les paramètres généraux
utilisent `Gu(t) = t²(3 − 2t)` ; `screenFade` et `groundFade` utilisent
`l1(t) = t(2 − t)`. L'anticipation `data-gl-lead` peut retarder le début de
l'interpolation jusqu'à une distance donnée, exprimée en hauteurs de fenêtre,
avant le repère suivant. Des amortissements s'ajoutent à ce calcul.

**Pour notre transition approuvée :** définir des états nommés, par exemple
accueil, apparition, ensemble des sept et projet sélectionné. Le scroll fournit
une progression ; caméra, lumière, points et panneaux peuvent suivre des courbes
coordonnées mais différentes. Les noms et paramètres futurs restent à concevoir.

## 7. Alignement DOM et 3D — nouveaux détails

`hu` mesure chaque élément associé avec `getBoundingClientRect()`. Son centre
et ses dimensions deviennent position et échelle d'un objet sous caméra
orthographique. `hr` règle cette caméra sur les demi-largeur et demi-hauteur
de la fenêtre ; `gu` déplace son groupe selon le défilement.

Les recalculs après redimensionnement sont temporisés de **100 ms**. Un
IntersectionObserver contrôle la visibilité du plan. Les changements de page
pilotent son opacité sur **0,6 seconde**, avec nettoyage des animations au retrait.
Cette couche est composée avec la scène perspective ; tous les éléments n'ont
pas besoin d'être placés dans le même espace de caméra.

La nouvelle capture retrouve aussi les liens nommés des dix projets dans l'arbre
d'accessibilité. Cela renforce notre choix de conserver titres et liens en HTML,
avec une couche 3D pour la profondeur et les médias. Une liste HTML présente
ne suffit cependant pas à valider toute la navigation au clavier ou le contraste.

## 8. Régulation de qualité — précision du comportement

`vf` calcule le ratio de rendu de base comme le minimum entre le ratio physique
de l'écran, **1,3** et **1920 / max(largeur, hauteur)**. Il applique ensuite un
multiplicateur choisi parmi **1 ; 0,88 ; 0,76**.

La surveillance commence après **3 secondes**. Chaque frame dépassant environ
20 ms augmente un score ; une frame plus rapide le réduit, sans descendre sous
zéro. Les pauses dépassant 100 ms sont ignorées. À un score de 30, la qualité
baisse d'un palier, puis attend **2 secondes** avant de pouvoir baisser encore.
Ce ne sont donc pas nécessairement 30 frames lentes consécutives. Cette fonction
ne remonte pas automatiquement la résolution pendant la même instance.

`hf` traite séparément le rythme d'appel au rendu, avec une cible de 60 images/s
et un seuil de 57. Ce réglage ne garantit pas 60 images/s. Nous pouvons adapter
la résolution et les effets tout en gardant l'ensemble des sept projets affiché.

## 9. Interface d'accueil et passage à sept projets — nouveaux détails

Le module `nodes/2.C1X5SI6c.js` masque l'introduction après **0,35 hauteur de
fenêtre** de défilement virtuel et présente l'interface de galerie après **0,95**.
Les fondus d'introduction durent 400 ms. Le titre et les commandes du carrousel
utilisent des transitions de 300 ms, avec 300 ms de délai à l'entrée ; les
commandes latérales arrivent depuis un décalage de 200 px.

Le nombre **10** est inscrit dans plusieurs composants : géométrie et matrices
de panneaux, rotation, tableaux de lumière, indices précédent/suivant de
l'interface. Passer à sept projets exige une source commune pour les données et
leur nombre, ainsi qu'une autre disposition. Modifier un seul compteur ne suffit
pas et ne répondrait pas à la demande d'une vue ouverte de tous les projets.

## Adaptation proposée, à discuter

**Décisions d'Emeryc :** conserver le paysage de points pendant l'apparition
des panneaux ; montrer tous les projets ensemble en gardant l'accent sur trois.

Proposition pour la vue d'ensemble sur ordinateur : sept panneaux dans une
composition ouverte, trois grands et quatre plus compacts, sans superposition
des titres. Les sept doivent apparaître dans la même séquence d'entrée ; les
trois phares gagnent en taille et en présence. L'agencement en deux rangées est
un candidat de maquette, pas une décision définitive.

Le cercle fermé de Mirage favorise la découverte successive des projets.
Nous devons donc adapter son agencement. Ses matériaux, sa lumière synchronisée,
ses transitions et la continuité du décor restent utilisables avec une vue
d'ensemble. Une sélection rapproche la caméra du panneau choisi ; un retour
explicite restitue l'ensemble, et un index maintient l'accès aux autres projets.

Piste architecturale : porter la fonction du terrain d'Ing Tian dans un ensemble
de points Three.js, afin que points et panneaux partagent caméra et profondeur.
Les titres et liens resteraient en HTML. Une base statique avec un composant
Three.js isolé est compatible avec cette intention ; reprendre Threlte demanderait
de choisir Svelte pour ce composant. La stack finale reste ouverte.

Il reste à comparer visuellement les positions, le champ de vision, l'éclairage
et les transitions sur une maquette ciblée. Les sept aperçus ne peuvent pas tous
rester grands et détaillés dans un seul écran de téléphone : prévoir une vue
compacte de tous les titres puis des cartes dans le défilement, sans projets cachés
derrière un filtre ou un carrousel imposé.

## Sources et reprise de l'étude

- [Module principal : géométrie, matériaux, caméra et composition](https://studiomirage.io/_app/immutable/nodes/0.BjG-yHQV.js).
  Empreinte SHA-256 : `aefb3eeb25f08333446c5b67c0731d9d3352a7915f1cf21b8268778aecc84d94`.
- [Moteur, GSAP et états de scène](https://studiomirage.io/_app/immutable/chunks/iTEJ16On.js).
- [Interface de l’accueil et commandes de galerie](https://studiomirage.io/_app/immutable/nodes/2.C1X5SI6c.js).
- [Composants Threlte](https://studiomirage.io/_app/immutable/chunks/B_VAJFjy.js).
- [Modèle du sol](https://studiomirage.io/_app/immutable/assets/Mirage_scene_03.Cdl4Dhyd.glb).
- [Manifeste des couleurs temporelles](https://studiomirage.io/color-timelines/color-timelines.json).

Les noms minifiés sont propres à cette version. Dans le module principal :
`Vc` construit les panneaux ; `au` gère le carrousel ; `lu` crée le shader du sol ;
`uu` charge le sol ; `fu` pilote la caméra ; `Gc` charge les couleurs ;
`sf` compose les effets ; `vf` adapte la résolution ; `Af` crée le canvas.

Evidence REA : `ev_0335cb7c6095bf018aa3227681473cea743d70875d2ebd733cc339eaf3c85bbb`.
Fichiers temporaires sous `/private/tmp/portfolio-rea-2026-10-14/` :
`mirage-modules/download-manifest.json`, `mirage-modules/glb-metadata.json`,
`mirage-3d-rea.json`, `mirage-3d-rea-summary.json` et `mirage-3d-rea.log`.
La fiche constitue la mémoire durable ; les sources temporaires ne sont pas
intégrées au portfolio. Aucune construction du site n'a été commencée.

La [nouvelle fiche REA](STUDIO_MIRAGE_REA_DEEP.md) documente les huit passes
supplémentaires, la capture CDP réussie et les limites restantes. Les
[preuves compactes](evidence/MIRAGE_REA_DEEP_EVIDENCE.json) conservent 17 appels
sélectionnés et la correspondance exacte des extraits avec les sources originales.
