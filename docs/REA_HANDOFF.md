# Passation — étude REA, design et architecture

Ce document permet de commencer un nouveau chat sans dépendre de l'historique
de la conversation de cadrage. État de départ : 13 octobre 2026.

## Dossier et documents de référence

Dépôt local : `/Users/emeryc/Portfolio/emerycchuttarsing.github.io`.
Remote : https://github.com/emerycchuttarsing/emerycchuttarsing.github.io

Lire d'abord [BRIEF.md](BRIEF.md), puis [ROADMAP.md](ROADMAP.md) et la
[fiche Samuel Rizzon](references/SAMUEL_RIZZON.md). Relire l'état Git et les
instructions locales applicables avant de modifier des fichiers. Les documents
de cadrage sont locaux ; aucun push ni déploiement n'a été effectué pendant leur préparation.

Les décisions à préserver sont : finance quantitative et ML/data, site en
anglais, priorité au capstone RL + signatures, puis Deep Hedging, puis Spotify.
Le CV a été lu ; une proposition de biographie et les chiffres à vérifier sont
dans le brief. Emeryc indique avoir réalisé tout le code des projets.

## Objectif du nouveau chat

Comprendre les références choisies avec REA et l'inspection du navigateur,
puis réfléchir avec Emeryc à la structure, au design et à l'architecture du
portfolio. La phase actuelle porte sur l'étude et les propositions.
Le développement du site complet viendra après discussion de ces propositions.

## Références à étudier

| Site | Rôle dans la direction retenue |
| --- | --- |
| [Ing Tian](https://ingtian.github.io/) | Élégance, composition, typographie et paysage de points de l'accueil. |
| [Alexander Rom](https://alexanderom.com/) | Identité finance, trajectoires, structure des pages de projets ; à enrichir d'une identité ML. |
| [Emmanuel Sabuni](https://www.sabuniemmanuelc.com/) | Organisation globale, hiérarchie des contenus, recherche et ingénierie. |
| [Samuel Rizzon](https://www.samuelrizzon.dev/) | Créativité, interactions, aperçus des projets et présentation ; référence complémentaire. |

Le [dépôt d'Alexander Rom](https://github.com/Arom-MFE/Arom-MFE.github.io)
est public. Vérifier la correspondance entre sa version et le site observé.
La fiche Samuel contient des observations préliminaires, pas un audit REA terminé.

## Préparation de REA

REA signifie **Reverse Engineer Anything**.
Source : [morluto/rea](https://github.com/morluto/rea).
Consulter sa [documentation web](https://rea.tools/guides/browser/) et les
[instructions d'installation](https://github.com/morluto/rea/blob/main/docs/installation.md)
dans leur version actuelle avant toute configuration.

- Emeryc a indiqué vouloir donner accès au dépôt REA. Localiser la copie et
  vérifier les intégrations existantes avant d'en installer une autre.
- Aucun outil REA n'était exposé dans le chat de cadrage ; l'absence d'installation
  sur la machine n'est pas établie. Aucun test REA n'a encore été effectué ici.
- Node v24.15.0 et npm 11.12.1 ont été observés pendant le cadrage ; revérifier
  l'environnement du nouveau chat et les prérequis de la version retenue.
- Consigner la version exacte utilisée et le mode d'accès au navigateur.
- Définir un emplacement ignoré par Git pour les captures et les traces brutes
  avant de les collecter ; conserver dans le dépôt les fiches et décisions utiles.
- REA sert à observer des preuves techniques ; la fidélité d'une reproduction
  devra être contrôlée par comparaison visuelle.

## Déroulement proposé

1. Réaliser un pilote sur l'accueil d'Ing Tian pour valider l'outil et la méthode.
2. Étudier les références par composant, sur ordinateur et mobile. Relever les
   URL, dates, dimensions de fenêtre et états d'interaction de chaque observation.
3. Pour chaque composant, distinguer ce qui est observé, confirmé par le code,
   déduit et encore inconnu. Examiner code public, scripts, DOM, styles et
   échanges réseau utiles à la compréhension.
4. Documenter les paramètres modifiables : disposition, police, couleurs,
   densité, vitesse, amplitude, défilement, interaction au pointeur, comportement tactile.
5. Proposer les adaptations aux vrais contenus quant/ML, avec une attention à
   la lisibilité des résultats, à l'accès au CV et au confort sur mobile.
6. Comparer les options frontend à partir des besoins effectivement observés :
   export statique, poids chargé, animations, pages de projets et maintenance.
7. Présenter une proposition de structure, de direction visuelle et d'architecture
   à discuter avec Emeryc avant la construction du site.

Les reproductions fidèles de composants servent à comprendre leurs mécanismes
et à tester des variations pendant la phase d'essais. Conserver la provenance
et vérifier les conditions de réutilisation du code et des assets effectivement repris.

## Livrables attendus

- Une fiche documentée par référence dans `docs/references/`, avec observations,
  mécanismes, limites de l'analyse, paramètres et pistes d'adaptation.
- Une comparaison des composants à retenir et de leur utilité pour le portfolio.
- Une proposition d'arborescence et de contenu pour l'accueil et une page projet.
- Une proposition d'architecture compatible avec GitHub Pages, avec les éventuels
  services externes clairement identifiés et justifiés.
- Un état de progression dans la roadmap pour que les chats suivants reprennent
  les conclusions sans refaire les recherches.

Les briefs et les fiches écrites constituent la mémoire du projet. Au début
d'un nouveau chat, demander explicitement leur lecture ; un nouveau chat ne
doit pas présumer disposer de tout l'historique du précédent.


## Mise à jour après le premier pilote — 13 octobre 2026

Lire maintenant la [synthèse Ing Tian × Studio Mirage](DESIGN_SYNTHESIS_ING_MIRAGE.md), les deux nouvelles fiches [Ing Tian](references/ING_TIAN.md) et [Studio Mirage](references/STUDIO_MIRAGE.md), et le [journal REA](references/REA_PILOT_2026-10-13.md).

La nouvelle direction demandée privilégie l'accueil d'Ing Tian et la mise en scène des projets de Mirage. REA 6.4.0 a été utilisé en CLI statique ; son intégration MCP et la capture runtime complète restent non validées. Les propositions restent à discuter ; aucun composant du site n'a encore été construit. Les traces brutes sont dans un dossier temporaire hors Git, dont le journal donne le chemin.


## Mise à jour : galerie complète et modules 3D — 13 octobre 2026

Emeryc a approuvé la transition du paysage de points vers les panneaux et demande
que tous les projets soient présentés ensemble, avec trois plus mis en avant.
La proposition initiale d'une galerie réservée aux trois phares est remplacée.
La [synthèse](DESIGN_SYNTHESIS_ING_MIRAGE.md) décrit une vue ouverte des sept projets.

Les anciens HTTP 403 de Mirage sont résolus pour les ressources étudiées.
Lire la [fiche des modules 3D](references/STUDIO_MIRAGE_3D.md) : Three.js r182,
Threlte, GSAP 3.14.2, panneaux vidéo instanciés, caméra, shaders et lumière
synchronisée sont confirmés. REA a parcouru 18 scripts sans erreur de parsing,
avec un graphe sémantique partiel. La capture runtime complète reste non validée.
Les essais visuels et le choix final de stack restent à discuter avant construction.

## Dernier état : approfondissement REA de Mirage — 13 octobre 2026

Lire la [nouvelle étude REA](references/STUDIO_MIRAGE_REA_DEEP.md), puis la
[fiche 3D enrichie](references/STUDIO_MIRAGE_3D.md). Huit passes statiques
supplémentaires ont été effectuées sur le même Mac : graphes principal et Threlte
récupérés, quatre extraits analysés sans troncature liée aux budgets. Le graphe
principal reste plafonné à 20 000 nœuds ; le gros fichier de bibliothèques échoue
encore en sémantique, mais son bloc d'états de scène a été analysé séparément.

Une capture CDP légère de l'accueil a réussi : canvas, dix vidéos, liens de
projets et certaines requêtes sont observés. Elle porte sur le chargement initial,
pas sur la fluidité ou un parcours complet. Les anciennes mentions d'échec CDP
concernent les tentatives précédentes. Les preuves compactes et les commandes
sont dans [MIRAGE_REA_DEEP_EVIDENCE.json](references/evidence/MIRAGE_REA_DEEP_EVIDENCE.json).

Nouveaux apports : ordonnanceur vidéo 2/4 lectures, cache distinct de trois
aperçus, repères HTML de caméra, courbes séparées de pose/fondu, alignement DOM/3D,
réglages mobiles et régulation de résolution. La synthèse intègre leurs implications
pour une galerie de sept projets. Prochaine étape : discuter et maquetter cette
composition avec les vrais contenus ; aucun développement ou déploiement commencé.

## Passage à la construction — dernière instruction d’Emeryc

Le [brief autonome pour l’agent codeur](BRIEF_AGENT_CODEUR.md) devient le point
d’entrée pour l’exécution. Emeryc autorise l’agent à choisir les textes et visuels
provisoires ; ils seront remplacés en aval. La priorité est le fonctionnement
des pages, de la scène, des données, du build et du déploiement. Le brief conserve
les sept projets et les trois phares, distingue les exigences confirmées des
choix techniques proposés, et fournit les critères de recette. Le site n’a pas
encore été construit ou publié dans ce chat.
