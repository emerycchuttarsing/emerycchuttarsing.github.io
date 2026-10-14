# Apport concret de REA dans l'étude du portfolio

Vérification des rapports existants, le 13 octobre 2026 (PDT).
Cette fiche précise l'attribution des résultats : collecte, REA, lecture du
code, puis choix de design. La vérification initiale utilisait les rapports
existants. Le complément en fin de fiche décrit les nouveaux passages demandés
ensuite. Aucune reproduction du site n'est encore construite.

## Ce qui a donné accès au code

Le navigateur et le téléchargement HTTP des ressources publiques ont fourni
les fichiers HTML, CSS et JavaScript, ainsi que les ressources 3D. REA a
analysé les fichiers déjà récupérés. Le téléchargement réussi des modules
Mirage, après les premiers HTTP 403, n'a pas été obtenu par REA.

Il s'agit des fichiers publiés et compilés, avec de nombreux noms abrégés.
Nous n'avons pas récupéré le dépôt de développement original ni le backend privé.

## Exemple 1 : suivre le calcul du terrain d'Ing Tian

Dans `ing-tian-rea-focused.json`, le graphe applicatif contient :

- `TerrainHero…js` importe `f` depuis `terrain.BfFMUilB.js` et l'appelle `ot`.
- Le module `terrain.BfFMUilB.js` exporte sa fonction locale `S` sous le nom `f`.
- Le même mécanisme relie `lt` à l'export `p`, puis à la fonction locale `Y`.
- `St` vient de l'export `p` du module `motion.u94fiHpI.js`.

Ce sont des relations présentes dans le rapport, avec fichier, position et
empreinte de la source. Elles confirment les correspondances entre noms
abrégés et modules. REA ne nomme pas automatiquement `S` « hauteur du terrain ».

La lecture de `S` montre une somme de cinq gaussiennes ; celle de `Y` montre
la projection des coordonnées sur l'écran. La lecture de TerrainHero montre
le dessin dans un Canvas 2D, le tri en profondeur, les points et leur respiration.
La fonction importée depuis `motion` lit la préférence de mouvement réduit.

Conséquence pour notre conception : la surface et son dessin sont séparables.
Nous pouvons reprendre le principe mathématique dans un ensemble de points
Three.js pour partager une vraie caméra et une profondeur avec les panneaux.
C'est une proposition d'adaptation ; elle n'est pas générée par REA.

## Exemple 2 : identifier les objets derrière les noms minifiés de Mirage

Dans `mirage-3d-rea.json`, les relations d'import de `nodes/0.BjG-yHQV.js`
contiennent notamment :

| Nom local | Export importé | Fichier résolu |
| --- | --- | --- |
| `Aa` | `z` | `chunks/iTEJ16On.js` |
| `He` | `bl` | `chunks/iTEJ16On.js` |
| `ji` | `bm` | `chunks/iTEJ16On.js` |
| `We` | `ah` | `chunks/iTEJ16On.js` |
| `Ce` | `T` | `chunks/B_VAJFjy.js` |

La lecture des exports et des déclarations du fichier cible permet ensuite
d'identifier respectivement BoxGeometry, ShaderMaterial, VideoTexture, GSAP
et les composants Threlte. Cette dernière identification vient de la lecture
du code ; le rapport ne fournit pas toute la chaîne sémantique de ces gros modules.

La fonction `Vc` du module principal construit une boîte de 1,61 × 0,98 × 0,05.
La fonction `au` en organise dix instances en cercle, leur affecte des médias
et anime le groupe. La fonction `fu` définit la caméra et son champ de vision de 15°.

Conséquence : nous pouvons concevoir sept panneaux partageant une géométrie,
avec tailles et positions adaptées à une vue d'ensemble. Il n'est pas nécessaire
de fabriquer un modèle complexe distinct pour chaque projet. La composition
ouverte des sept projets vient de la demande d'Emeryc et de notre design.

## Exemple 3 : comprendre la lumière de Mirage

La lecture directe de `Gc`, `zc` et du shader créé par `lu`, complétée par
`color-timelines.json`, a révélé la chaîne suivante :

1. Charger une texture contenant les couleurs temporelles pré-calculées.
2. Lire la progression de chaque vidéo.
3. Échantillonner la couleur correspondante.
4. Calculer une contribution lumineuse sur le sol selon la position du panneau.

REA n'a pas produit cette explication et son graphe sémantique du module
principal est incomplet. Il ne faut donc pas attribuer à l'outil la découverte
automatique de la synchronisation ou des équations d'éclairage.

Conséquence : nos aperçus scientifiques peuvent commander l'ambiance lumineuse
du paysage. Nous disposons d'un procédé concret à tester, avec des couleurs
et des intensités contrôlables, avant de rechercher des effets plus complexes.

## Exemple 4 : ce que les rapports ne prouvent pas

Le rapport sur l'amorçage de Mirage identifie deux imports dynamiques vers les
fichiers `start` et `app`. La lecture du HTML identifie SvelteKit et les données
Prismic. Cela n'expose pas la logique serveur privée ni l'administration du CMS.

La vérification détaillée révèle aussi des faux positifs : certains appels à
`uniforms.get`, dont celui qui lit `uTime`, sont étiquetés comme endpoints réseau.
Le code montre un accès local à une Map de paramètres de shader. Ce libellé
du rapport ne doit donc pas être retenu comme preuve d'un appel HTTP.

Les « 777 constats » ne sont pas 777 découvertes utiles au design. Ils regroupent
notamment des relations d'import répétées par symbole et des détections à
vérifier. L'absence d'erreur de parsing ne signifie pas une compréhension complète.

## Évaluation de l'utilité dans cette étude

REA a surtout servi de vérification structurée des dépendances, de localisation
des relations dans les fichiers et de conservation des preuves. Les mécanismes
visuels détaillés ont été compris principalement par lecture du code et
observation. Nous aurions pu arriver à l'essentiel de ces conclusions sans REA ;
je ne peux pas démontrer un gain de temps net sur ces deux sites.

Son apport au backend est limité aux éléments publiquement exposés. Lors du
premier pilote, la capture runtime avait échoué : les rapports statiques ne
validaient donc ni performances ni requêtes effectives. Le complément ci-dessous
apporte une première observation directe, encore limitée à l'initialisation.

## Preuves consultables

Les [extraits sélectionnés des rapports](evidence/REA_SELECTED_EVIDENCE.json)
conservent les relations citées, leurs identifiants Evidence, leurs positions,
leurs empreintes et leurs limites. Les champs `manual_review` sont nos
annotations, ajoutées explicitement aux faux positifs ; le reste des relations
est extrait des rapports existants.

Les sources et leurs URL figurent dans les fiches [Ing Tian](ING_TIAN.md) et
[Mirage 3D](STUDIO_MIRAGE_3D.md). Le [journal du pilote](REA_PILOT_2026-10-13.md)
donne les commandes, l'environnement et les chemins des sorties brutes.

## Complément : ce que la nouvelle passe a ajouté

La [nouvelle analyse Mirage](STUDIO_MIRAGE_REA_DEEP.md) apporte des preuves
supplémentaires, conservées dans un [second fichier d'extraits](evidence/MIRAGE_REA_DEEP_EVIDENCE.json).
Elle ne transforme pas REA en générateur automatique de design.

- **Davantage de relations effectivement conservées.** Les graphes du module
  principal et de Threlte sont maintenant disponibles. Le premier reste tronqué
  au plafond logiciel de 20 000 nœuds par fichier.
- **Des chaînes d'appels plus utiles.** Quatre extraits avec provenance exacte
  permettent de suivre `Ow → Gu / l1 / h1` pour les interpolations de scène,
  l'appel à `eu` pour l'ordonnanceur vidéo et `Oi → qt` pour la libération du cache.
  REA fournit appels, fonctions et positions ; la lecture du code donne leurs
  paramètres et leur rôle visuel.
- **Une observation en exécution réussie.** REA a retrouvé le canvas, les dix
  éléments vidéo et les liens de projets, et observé des réponses HTTP 200 pour
  les textures de normales et de bruit du sol. Cette preuve est distincte de
  l'identification statique de leurs références dans le code.

Concrètement, nous avons maintenant une base mieux documentée pour limiter les
vidéos actives tout en montrant sept panneaux, séparer courbes de déplacement et
de fondu, aligner la scène sur le HTML et gérer le coût des textures. Ce sont nos
adaptations, fondées sur des mécanismes lus et des relations vérifiées.
La fluidité, le parcours complet, le backend privé et la fidélité visuelle restent
non validés ; aucun gain de temps net de REA n'a été mesuré.
