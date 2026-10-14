# Studio Mirage — nouvelle analyse REA ciblée

13 octobre 2026, America/Los_Angeles ; 14 octobre UTC. REA CLI 6.4.0.
Cette étude prolonge le [pilote](REA_PILOT_2026-10-13.md) et enrichit la
[fiche des mécanismes 3D](STUDIO_MIRAGE_3D.md).

## Résultat

Huit nouvelles passes statiques ont été effectuées, puis une capture CDP légère.
Les graphes du module principal et de Threlte, précédemment écartés du résultat
pour des raisons de budget, sont maintenant conservés. Quatre extraits ciblés
couvrent les panneaux et vidéos, le sol et les caméras, les effets et la qualité,
puis les états de scène. Aucun de ces quatre graphes n'est tronqué par un budget.

Une première observation REA en exécution a également réussi sur l'accueil.
Elle confirme la présence du canvas, des dix vidéos, des modules étudiés et des
liens de projets. Elle porte sur l'initialisation, sans parcours interactif ni
mesure de fluidité. Aucun développement du portfolio n'a été commencé.

Les [preuves sélectionnées](evidence/MIRAGE_REA_DEEP_EVIDENCE.json) conservent
les résumés des huit passes, 17 relations d'appel, les empreintes, la provenance
des extraits et les observations runtime utiles. Les chiffres des différentes
passes **ne s'additionnent pas** : leurs périmètres se recouvrent.

## 1. Ce qui a changé dans l'analyse

La première analyse réunissait 18 scripts. La nouvelle procédure exécute les
passes une à une sur le même Mac, qui dispose de 8 Gio de RAM physique.
Le parent Node dispose de 2 048 Mio et le worker de 1 536 Mio pour les gros
modules ; les extraits utilisent respectivement 1 536 et 1 024 Mio. Le délai
par fichier passe de 60 à 180 secondes. Aucune des nouvelles passes statiques
n'a atteint ce délai : l'augmenter n'explique pas à lui seul les gains.

| Passe | Périmètre | Nœuds / relations sémantiques | Temps | Résultat |
| --- | --- | ---: | ---: | --- |
| `main-isolated` | Module principal original, 305 773 octets | 20 000 / 16 565 | 7,06 s | Graphe conservé ; plafond de nœuds atteint |
| `threlte-isolated` | Module Threlte original, 67 721 octets | 18 595 / 19 839 | 6,07 s | Graphe conservé, sans troncature |
| `home-isolated` | Interface d'accueil originale, 5 589 octets | 1 690 / 1 901 | 3,05 s | Sans troncature |
| `scene-state-isolated` | Bibliothèques + états, 676 336 octets | 1 / 0 | 11,09 s | Worker à court de heap pendant la sémantique |
| `state-focus` | Extrait des états et repères HTML, 8 028 octets | 1 919 / 1 676 | 2,08 s | Sans troncature |
| `gallery-focus` | Extrait panneaux, couleurs et vidéos, 19 780 octets | 4 373 / 4 684 | 2,59 s | Sans troncature |
| `ground-camera-focus` | Extrait sol, caméra et plans DOM, 18 864 octets | 2 826 / 2 974 | 2,06 s | Sans troncature |
| `effects-focus` | Extrait effets, composition et qualité, 28 636 octets | 4 656 / 4 005 | 2,59 s | Sans troncature |

« Sans troncature » ne signifie pas compréhension exhaustive : REA conserve
`coverage.status: unknown` pour ces graphes, avec des relations dynamiques
non résolues. Les graphes applicatifs et sémantiques ont des couvertures distinctes.
Un statut applicatif `complete` ne rend pas le graphe sémantique complet.

### Trois limites différentes, désormais vérifiées

1. **Conservation des résultats.** La première passe pouvait analyser un fichier
   puis écarter son gros graphe afin de réserver de la place aux fichiers suivants.
   L'isolation et les nouveaux budgets ont permis de conserver ceux du module
   principal et de Threlte. Les deux variables ayant changé ensemble, leur
   contribution respective n'a pas été mesurée séparément.
2. **Plafond structurel de REA.** Le code de REA fixe 20 000 nœuds sémantiques par
   fichier et 100 000 pour l'ensemble. Le rapport affiche le plafond global même
   quand la limite par fichier a été atteinte. Plus de RAM ne supprimerait pas
   cette limite logicielle. Elle explique la troncature restante du module principal.
3. **Mémoire du worker.** Le gros fichier `iTEJ16On.js` échoue encore pendant
   l'analyse sémantique avec 1 536 Mio de heap. Son petit bloc de logique propre
   à Mirage passe lorsqu'il est extrait des bibliothèques. Le moteur Three.js
   entier n'est donc toujours pas couvert par un graphe sémantique exploitable.

Le pic RSS agrégé parent + descendants **échantillonné** est d'environ 655 Mio
pour le module principal, 632 Mio pour Threlte, 1 650 Mio pour la passe qui échoue
et 484–504 Mio pour les quatre extraits. Ces valeurs sont des observations
ponctuelles de processus, pas des pics instantanés garantis ni la consommation
de toute la machine. Aucun échantillon utile n'a été obtenu pour la passe accueil.
Ces résultats ne démontrent pas une insuffisance du Mac pour construire le portfolio.

## 2. Ce que les nouveaux graphes apportent réellement

REA relie désormais des appels locaux précis dans les sections auparavant
mal couvertes. La signification visuelle provient ensuite de la lecture des
fonctions correspondantes, sans exécution du code pendant l'analyse statique.

| Relation vérifiée par REA | Lecture du code et conclusion utile |
| --- | --- |
| Appel à `eu` dans l'initialisation des vidéos de `au` | L'ordonnanceur autorise 2 vidéos sur Safari, 4 ailleurs, puis un mode centré sur le projet actif. Tous les panneaux peuvent rester visibles sans toutes les vidéos en lecture. |
| `Oi` appelle `qt` ; `Tn` appelle `Oi` | Le cache des vidéos d'aperçu externes à la galerie contient au plus trois entrées ; l'éviction libère la texture et décharge la vidéo. Ce plafond ne concerne pas les dix vidéos du carrousel. |
| `Ow` appelle `Gu`, `l1` et `h1` | L'interpolation de pose et les fondus suivent des courbes distinctes. Nous pouvons synchroniser caméra, paysage et apparitions sans leur imposer le même rythme. |
| Le gestionnaire interne de `Ww` appelle `I_` | Les sections HTML munies de `data-gl-state` deviennent des repères de scène, recalculés lors des changements de contenu et de taille. |
| `gu` appelle `hr`, et sa boucle de plans appelle `hu` | Une caméra orthographique et des mesures DOM alignent des objets 3D sur la mise en page HTML. Les textes et liens peuvent rester natifs. |
| Les callbacks du canvas `Af` appellent `hf`, `vf` et `lf` | Le rythme de rendu, la résolution et la perte de contexte WebGL sont gérés séparément. Ces appels ne prouvent pas les performances obtenues. |

Les paramètres nouveaux et leurs implications figurent dans les sections 5 à 9
et la table mobile de la [fiche 3D](STUDIO_MIRAGE_3D.md).
Les faux positifs de la première analyse restent à prendre en compte : une
relation étiquetée « endpoint » autour d'un `.get()` ne prouve pas un appel HTTP.

## 3. Première capture REA en exécution réussie

Un seul Chrome headless temporaire, avec un profil neuf et une fenêtre demandée
de 1 280 × 900, a été lancé puis arrêté. Aucun navigateur personnel n'a été fermé.
Version observée : Chrome 155.0.8059.79. La capture n'incluait pas les sources
JavaScript, déjà analysées séparément, ni les valeurs de stockage.

La fenêtre annoncée par REA va de **03:28:24.753 à 03:28:27.342 UTC** ;
`observation_ms=500` est le temps d'observation demandé, pas la durée totale
incluant les instantanés. La procédure entière a pris 9,52 secondes.

Résultats observés dans le rapport :

- Accueil `https://studiomirage.io/` ; 549 nœuds DOM, dont **1 canvas et 10 vidéos**.
- 547 nœuds dans l'arbre d'accessibilité, dont des liens nommés pour les dix
  projets et les commandes de navigation. Ce nombre inclut les nœuds ignorés.
- 21 scripts répertoriés et 28 ressources du périmètre autorisé. Les noms
  versionnés et les tailles des modules principal, états et Threlte correspondent
  à ceux étudiés. Les octets n'ont pas été recollectés par cette capture.
- Trois requêtes HTTP observées avec statut 200 : le petit module `nodes/1`,
  `ground-normal-512.Dl4_wN7d.webp` et `noise-seamless-512.CgE0VwGp.webp`.
  Une URL `blob:` apparaît aussi, sans statut HTTP.

C'est une confirmation en exécution de la structure et du chargement de certaines
ressources. L'arbre d'accessibilité indique encore une page occupée (`busy`).
La capture n'établit donc ni un état visuel stabilisé, ni le nombre de vidéos
réellement jouées, ni la cadence de rendu.

Le rapport est `policy_filtered`, avec une couverture réseau limitée à la période
après attachement et à l'origine autorisée. Les médias externes sont exclus.
Aucune section n'est déclarée indisponible ou tronquée. Un journal console vide
ne démontre pas l'absence d'erreurs avant la capture ou dans les origines exclues.
Ces nombres ne servent pas à calculer le poids total du site.

## 4. Provenance et reproduction

Sources originales conservées temporairement sous :

`/private/tmp/portfolio-rea-2026-10-14/mirage-modules/_app/immutable/`

Rapports complets, logs, entrées isolées et extraits sous :

`/private/tmp/portfolio-rea-2026-10-14/mirage-deep/`

La commande suivante illustre la passe principale ; les commandes exactes des
huit passes sont conservées dans le JSON de preuves :

```sh
node --max-old-space-size=2048 /private/tmp/rea-portfolio-tools/node_modules/rea-agents/scripts/rea.mjs analyze-javascript-application /private/tmp/portfolio-rea-2026-10-14/mirage-deep/inputs/main --analysis-timeout-ms 180000 --max-heap-mb 1536 --format json
```

Les extraits reprennent **à l'identique** des déclarations de premier niveau et
les imports originaux, joints par des sauts de ligne. Les limites sont repérées
avec le parseur Babel ; aucun symbole n'a été renommé ni remplacé par un faux objet.
Le manifeste conserve les SHA-256 et les intervalles UTF-16 d'origine et de copie.
Les 17 positions d'appel sélectionnées ont été remappées et leur texte comparé
à celui de la source originale. Leurs positions dans REA restent celles de l'extrait.

Les déclarations hors extrait et les dépendances importées ne sont pas disponibles
dans ces passes isolées. Le premier rapport de 18 fichiers reste la référence
pour les relations d'import entre modules. Les nouvelles passes le complètent ;
elles ne constituent pas un graphe fusionné de tout le site.

Le code de développement original, le backend privé, le procédé de génération
hors ligne des couleurs, les performances mobiles et la fidélité d'une future
reproduction restent hors de ce qui a été vérifié. Les fiches et preuves compactes
sont la mémoire durable ; les rapports volumineux demeurent temporaires hors Git.
