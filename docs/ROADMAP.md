# Feuille de route du portfolio

> Mise à jour : la construction suit désormais les [cinq jalons](MILESTONES.md). Le contenu ci-dessous conserve la feuille de route préparatoire.

Statut : cadrage confirmé ; pilote Ing Tian × Studio Mirage et mécanismes 3D documentés. Transition points → panneaux approuvée ; tous les projets doivent être visibles dans la galerie, avec trois phares. Analyse REA statique approfondie ; capture CDP initiale réussie, parcours complet et performances non mesurés. Le développement du site n'a pas commencé.

## Objectif

Créer un portfolio destiné aux recruteurs, présentant les projets de finance
quantitative, de machine learning et d'ingénierie. Le site sera publié
sur GitHub Pages. Les résultats présentés devront être rattachés aux expériences
et aux contributions personnelles qui les justifient.

## Direction artistique retenue

| Référence | Éléments à étudier et à adapter |
| --- | --- |
| [Ing Tian](https://ingtian.github.io/) | Élégance de l'accueil, typographie, composition, paysage de points, mise en scène des explications mathématiques. |
| [Alexander Rom](https://alexanderom.com/) | Identité finance, trajectoires de prix, sobriété, structure et profondeur des pages de projets. Ajouter une identité ML cohérente. |
| [Emmanuel Sabuni](https://www.sabuniemmanuelc.com/) | Organisation des sections, accès aux projets et au CV, articulation entre recherche et ingénierie. |
| [Samuel Rizzon](https://www.samuelrizzon.dev/) — référence complémentaire | Créativité, construction animée des éléments, aperçus de projets et visualisations interactives. Pistes à étudier, sans décision de reprendre son thème pixel art. Voir la [fiche d'analyse](references/SAMUEL_RIZZON.md). |

Le but est de comprendre les mécanismes et de reproduire fidèlement les
composants retenus dans des essais locaux, puis de les adapter aux vrais contenus
du portfolio. Chaque composant étudié doit avoir une description de ses
paramètres afin de faciliter les variations.

## État initial vérifié

- Dépôt local : `Portfolio/emerycchuttarsing.github.io`.
- Remote : https://github.com/emerycchuttarsing/emerycchuttarsing.github.io
- Branche initiale : `main`, sans modifications locales avant cette feuille de route.
- Contenu initial : `README.md` et premier commit `274d594`.
- Node.js : `v24.15.0` ; npm : `11.12.1`.
- L'utilisateur indique avoir connecté Cursor et GitHub.
- Aucune intégration REA n'est disponible dans les outils de cette session.
  Cela ne permet pas de conclure à l'absence d'une installation ailleurs.
- La publication GitHub Pages et l'authentification permettant de pousser des
  commits n'ont pas encore été testées.

## Décisions confirmées

Le [brief](BRIEF.md) rassemble les décisions données par Emeryc et une première
proposition de biographie tirée de son CV.

- Postes prioritaires : finance quantitative et machine learning, incluant la data science.
- Langue de la première version : anglais.
- Contribution personnelle : Emeryc indique avoir réalisé tout le code des projets.
  Cette attribution de l'implémentation conserve le contexte académique ou collectif
  du projet lorsqu'il est mentionné dans le CV.
- Ordre des projets mis en avant : capstone RL et Rough Path Signatures,
  Signature-Based Deep Hedging, puis Spotify.
- CV fourni et lu ; première biographie en anglais proposée dans le brief.
- Hébergement : GitHub Pages pour le portfolio ; les fonctions nécessitant un
  serveur à l'exécution peuvent être hébergées séparément.
- Technologies frontend : choix après l'étude REA, selon les interactions retenues.

Restent à discuter après l'étude : arborescence, composition de l'accueil,
message final, stack, interactions retenues et place des autres projets.
Le portrait et les liens de contact définitifs seront arrêtés pendant l'intégration.

## Étapes et livrables

| Étape | Travail | Livrable et critère de fin |
| --- | --- | --- |
| 1. Cadrage | Cible, langue, contribution et projets prioritaires confirmés ; biographie proposée. Affiner le message et l'arborescence avec l'étude REA. | [Brief](BRIEF.md) disponible ; composition et textes finaux à valider après l'étude. |
| 2. Préparation de REA | Vérifier la version publiée et les fonctions web disponibles, configurer l'intégration retenue, tester une capture sur une page publique. | Une capture exploitable avec structure et scripts ; version et procédure documentées. |
| 3. Étude des références | Étudier les trois références principales et les interactions complémentaires de Samuel Rizzon sur ordinateur et mobile ; relever leurs dimensions, styles, interactions et sources publiques disponibles. | Une fiche par référence, une liste de composants et les paramètres de leurs variations. |
| 4. Préparation des projets | Examiner les expériences existantes, choisir les résultats pertinents, exporter les figures et rédiger les études de cas. | Une fiche factuelle par projet, avec provenance des chiffres et figures. |
| 5. Maquette et essais visuels | Composer l'accueil et une page projet avec les vrais contenus ; réaliser ensuite des essais isolés des animations retenues. | Une direction visuelle cohérente, relue sur ordinateur et mobile avant la généralisation. |
| 6. Construction | Choisir la stack, créer les composants réutilisables, intégrer les pages, les figures, le CV et les interactions. | Version locale complète dont les pages et ressources fonctionnent après génération statique. |
| 7. Vérification et publication | Vérifier navigation, mobile, clavier, mouvement réduit, lisibilité, liens, performances et aperçu des liens partagés ; configurer GitHub Pages. | Site publié et vérifié à son URL publique, avec procédure de mise à jour. |

L'étude visuelle et l'inventaire des résultats peuvent avancer en parallèle une
fois le cadrage stabilisé.

## Utilisation prévue de REA

REA est un outil d'inspection. Sa documentation décrit l'observation de pages,
des scripts chargés, des échanges réseau et de captures d'écran demandées.
Les éléments observés servent ensuite à expliquer et à reconstruire les
comportements. La fidélité visuelle sera vérifiée séparément, avec des captures
comparables ; elle ne sera pas présumée à partir d'une analyse réussie.

Pour chaque composant étudié :

1. Définir la question précise, par exemple le mouvement du paysage de points
   de l'accueil d'Ing Tian.
2. Chercher le code public correspondant au site et noter la version étudiée.
   Le [dépôt d'Alexander Rom](https://github.com/Arom-MFE/Arom-MFE.github.io)
   est consultable et contient HTML, CSS, JavaScript et pages de projets.
   La correspondance exacte avec le site actuellement publié reste à vérifier.
3. Utiliser REA pour relier les scripts aux comportements observés lorsque cela
   apporte une information utile.
4. Compléter par les mesures de mise en page et les observations dans le navigateur.
5. Décrire la logique dans une fiche lisible et relever ses paramètres :
   couleurs, typographie, densité, amplitude, vitesse, mouvement au défilement,
   réponse au pointeur et adaptation mobile, selon le composant.
6. Au stade des essais visuels, réaliser une reproduction locale ciblée et la
   comparer à la référence à viewport et état d'interaction identiques.
7. Adapter ce composant à notre identité et à nos résultats ; noter la
   provenance et les conditions de réutilisation des éléments effectivement repris.

Premiers composants à étudier : accueil et paysage de points d'Ing Tian,
trajectoires financières d'Alexander Rom, navigation et présentation des
projets d'Emmanuel Sabuni, puis une page de recherche d'Alexander Rom.

Sources REA consultées pour préparer ce plan :

- [Dépôt et présentation](https://github.com/morluto/rea)
- [Inspection web](https://rea.tools/guides/browser/)
- [Installation et versions](https://github.com/morluto/rea/blob/main/docs/installation.md)

L'installation et les essais de REA restent à effectuer. Ils ne constituent pas
une dépendance à intégrer au site publié : REA est un outil de travail local.

## Contenu des études de cas

Trame commune : contexte et objectif, contribution personnelle, données,
méthode et architecture, résultats comparés à une référence, limites, puis
liens vers code, rapport ou démonstration.

| Projet | Angle possible | Éléments à vérifier et à extraire |
| --- | --- | --- |
| Capstone SinFench — priorité 1 | Trading, apprentissage par renforcement et Rough Path Signatures | Comparaisons D3QN/PPO/SAC, périodes d'évaluation, frais, risque et résultats hors échantillon. Distinguer l'expérience temporelle sur les signatures des performances de trading. |
| Deep hedging — 223 — priorité 2 | Finance mathématique et réseaux de neurones | Comparaison historiques bruts/signatures, distributions de pertes, métriques de risque et coût de calcul selon les sorties disponibles. |
| Spotify — 242B — priorité 3 | Système de recommandation complet | Comparaison ALS/SASRec, compromis pertinence/diversité, architecture et capture de l'application. Identifier la copie de référence. |
| Optimization 240 | Optimisation et prédiction de liens | Objectif optimisé, convergence et performances de prédiction sur Last.fm. |
| Data 100 | Computer vision et analyse de données | Exemples d'images, caractéristiques, protocole de classification et résultats enregistrés. |
| Transformer — 242B Homework 3 | Génération de texte et compréhension des Transformers | Projet décrit par l'utilisateur comme une construction end-to-end. Données TinyStories, scripts de tokenisation BPE, modèle, entraînement et génération, poids enregistrés et courbes de loss/perplexité repérés. Examiner leur fonctionnement et les résultats avant rédaction. |
| Case AKO | Data science appliquée à un problème métier | Étude de cas d'entretien sur la prévision de la demande de produits par magasin. Examiner la préparation des données, la validation temporelle, les prévisions et leur interprétation métier. |

Cette liste décrit des pistes de présentation, pas une validation des résultats.
Pour chaque chiffre retenu, conserver le fichier source, la configuration ou
version pertinente et le protocole de calcul. Les jeux de données et modèles
volumineux restent dans les projets d'origine.

## Organisation du travail

- Ce dépôt est la référence commune pour les décisions, les textes et le site.
- Garder `main` comme version stable et utiliser des branches `codex/...` pour
  les chantiers techniques, avec des commits courts et descriptifs.
- Si Cursor et un autre agent travaillent en même temps, leur attribuer des
  fichiers ou branches distincts ; éviter les modifications concurrentes d'un même fichier.
- Vérifier localement les changements avant de les publier.
- Avant la première collecte REA, définir un dossier local ignoré par Git pour
  les captures brutes ; versionner les fiches d'analyse utiles au projet.
- Conserver les outils d'analyse, les contenus et le code du site dans des
  emplacements distincts. La structure définitive sera créée au moment utile.
- Relier les démos nécessitant Python ou un serveur à un hébergement séparé ;
  les pages et figures du portfolio resteront compatibles avec GitHub Pages.

## Prochaine séance

Ouvrir un chat dédié à l'étude REA dans le projet du portfolio, en lui faisant
lire le [document de passation](REA_HANDOFF.md). Vérifier l'intégration REA,
puis commencer par l'accueil d'Ing Tian avant d'étudier les autres références.
Le résultat attendu de cette phase est un ensemble de fiches d'analyse et une
proposition argumentée de structure, de design et d'architecture, à discuter
avant la construction du site.


## Mise à jour — pilote du 13 octobre 2026

Emeryc précise la direction : partir de l'accueil d'Ing Tian et enrichir les projets avec la créativité de Studio Mirage, dans l'esprit des références Awwwards. Cette direction reste à discuter au niveau des composants avant la construction.

- [Ing Tian](references/ING_TIAN.md) : composition, terrain mathématique, scripts et styles étudiés.
- [Studio Mirage](references/STUDIO_MIRAGE.md) : galerie, index et page Renault Trucks observés ; [moteur et modules 3D](references/STUDIO_MIRAGE_3D.md) étudiés : Three.js/Threlte, panneaux, caméra, shaders et couleurs synchronisées.
- [Journal REA](references/REA_PILOT_2026-10-13.md) : version 6.4.0, preuves et limites. Les analyses statiques ciblées ont réussi ; l'observation CDP complète n'a pas abouti.
- [Proposition de structure, design et architecture](DESIGN_SYNTHESIS_ING_MIRAGE.md) à discuter.

L'étape 2 est validée pour l'analyse statique CLI uniquement. L'étape 3 a avancé sur ces deux références, sans audit exhaustif. Prochaine étape : discuter du cadrage ouvert des sept projets, de la hiérarchie des trois phares et des effets retenus, puis préparer les maquettes et essais ciblés de l'étape 5. La continuité du paysage de points vers les panneaux est approuvée.


### Précision d'Emeryc et complément 3D — 13 octobre 2026

La galerie doit montrer tous les projets ensemble avec l'accent sur trois ;
la proposition initiale d'un carrousel 01/03 est remplacée. La transition du
paysage de points vers les panneaux est retenue. Les modules publics de Mirage
sont maintenant accessibles : analyse REA de 18 scripts avec 0 erreur de parsing,
couverture sémantique partielle. Une composition ouverte en deux rangées est
proposée dans la synthèse, sans être encore validée visuellement.

### Approfondissement REA Mirage — 13 octobre 2026

La [nouvelle fiche](references/STUDIO_MIRAGE_REA_DEEP.md) consigne huit passes
statiques et une capture CDP initiale réussie. La [fiche 3D](references/STUDIO_MIRAGE_3D.md)
et la [synthèse](DESIGN_SYNTHESIS_ING_MIRAGE.md) intègrent les nouveaux mécanismes :
vidéos limitées sans cacher de panneaux, cache et nettoyage, poses selon les
sections HTML, courbes d'interpolation distinctes, réglages mobiles et qualité.

L'étape 2 dispose désormais d'une observation runtime initiale exploitable en
plus de la CLI statique. La couverture sémantique de tout Mirage reste partielle ;
la navigation complète et les performances ne sont pas vérifiées. Le prototype
ciblé devra mesurer ces aspects avec nos sept projets. La construction du site
reste en attente de la discussion de structure, de design et d'architecture.

### Dossier de transfert à l’agent codeur — 13 octobre 2026

Le [brief d’exécution](BRIEF_AGENT_CODEUR.md) est prêt à transmettre. Les contenus
définitifs ne conditionnent plus le démarrage : l’agent peut construire une V1
complète avec des textes et visuels provisoires, centralisés pour remplacement.
La base proposée est Astro + TypeScript + Three.js avec génération statique sur
GitHub Pages. Les vérifications portent sur les pages, les sept projets, la
scène, le mobile, les modes de repli et la publication. La validation des résultats
scientifiques se poursuit séparément de la construction fonctionnelle.
