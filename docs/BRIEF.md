# Portfolio brief

Décisions confirmées par Emeryc le 13 octobre 2026. Les textes anglais ci-dessous
sont des propositions éditoriales, à affiner avec le design.

## Positionnement et public

- Nom : Emeryc Chuttarsing.
- Public : recruteurs et équipes techniques en finance quantitative, ML et data science.
- Première version du site : anglais.
- Message : associer les fondements mathématiques, l'expérimentation rigoureuse
  et la capacité à construire des systèmes complets.
- Hébergement retenu : GitHub Pages.
- Stack frontend : à choisir après l'étude REA des références.

L'implémentation des projets est attribuée à Emeryc conformément à son indication.
Le CV décrit le capstone comme un projet de recherche en équipe : conserver
ce contexte tout en précisant sa responsabilité sur le code.

## Projets prioritaires

| Ordre | Titre de travail en anglais | Message à faire ressortir |
| --- | --- | --- |
| 1 | Reinforcement Learning & Path Signatures for Crypto Markets | Représentation des trajectoires, comparaison de politiques, validation temporelle et prise en compte des coûts et du risque. |
| 2 | Signature-Based Deep Hedging | Couverture d'options dépendantes du chemin, signatures, réseaux de neurones et maîtrise du risque de queue. |
| 3 | Multi-Stage Music Recommendation | Système ALS → SASRec → MMR, de la recherche de candidats à la sélection finale avec un compromis pertinence/diversité. |

Les projets Transformer, Optimization 240, Data 100 et Case AKO restent dans
l'inventaire. Emeryc demande que les sept projets soient présentés ensemble
dans la galerie, avec davantage de présence pour les trois prioritaires.
La transition du paysage de points vers les panneaux est approuvée ; leur
agencement exact reste à maqueter.

## Base éditoriale issue du CV

Source locale : `/Users/emeryc/Downloads/Emeryc_Chuttarsing_Resume.pdf`, une page.
Les dates et les expériences ci-dessous sont celles du document fourni ; elles
ne constituent pas une vérification indépendante des résultats ou du statut actuel.

- Formation à UC Berkeley : MEng IEOR, spécialisation FinTech, août 2025–mai 2026.
- Formation d'ingénieur aux Arts et Métiers, 2022–2025 ; formation en économie
  à Paris Dauphine–PSL, 2023–2024.
- EquitX : cofondateur technique et lead engineer selon le CV ; simulations de
  demande et moteur d'allocation d'enchères utilisant OR-Tools CP-SAT.
- CCHE : expérience de prévision des délais avec CatBoost et d'analyse opérationnelle.
- Compétences centrales : Python, PyTorch, statistiques, processus stochastiques,
  optimisation, apprentissage par renforcement et ingénierie financière.

Ces expériences pourront nourrir la biographie et une section Experience.
Elles ne changent pas l'ordre des trois projets prioritaires.

Proposition de titre pour l'accueil :

> Quantitative Finance & Machine Learning

Proposition de courte biographie en anglais :

> I'm Emeryc Chuttarsing. I build models and systems at the intersection of quantitative finance and machine learning. My training at UC Berkeley and Arts et Métiers brings together stochastic modeling, optimization, and engineering. My projects span reinforcement learning for financial markets, neural hedging, and recommendation systems, with an emphasis on rigorous evaluation and practical implementation.

## Résultats à relier aux preuves

Le CV fournit des pistes chiffrées à rapprocher des sorties d'expériences avant
la rédaction des études de cas :

- Capstone : 91,4 % contre 68,0 % de précision sur une expérience temporelle
  contrôlée. Ne pas présenter ce chiffre comme une performance de trading.
- Deep hedging : réduction annoncée de 24 % de la taille du modèle et de 27 %
  du risque de queue hors échantillon ; retrouver la métrique et la comparaison exactes.
- Spotify : améliorations annoncées de Recall@100 et NDCG@10 de 56 % et 156 %
  contre la référence de retrieval ; documenter le protocole et les valeurs absolues.

Chaque résultat affiché doit renvoyer à un fichier, une configuration et un
protocole. Les courbes et tableaux exportés seront préparés à l'étape 4 de la roadmap.

## Ce que signifie un site statique sur GitHub Pages

La génération prépare les fichiers HTML, CSS, JavaScript, images et données
avant publication. Pages les distribue ; le navigateur du visiteur exécute
ensuite le JavaScript. Des outils peuvent tourner localement ou pendant un
workflow de construction sans devenir un serveur disponible aux visiteurs.

| Besoin | Conséquence pour ce portfolio |
| --- | --- |
| Animations, Canvas/WebGL, 3D, transitions, filtres | Possibles dans le navigateur ; vérifier fluidité sur mobile et mouvement réduit. |
| Courbes, tableaux, sélecteurs de stratégies ou périodes | Possibles à partir de résultats exportés en JSON/CSV ; des calculs légers peuvent aussi tourner dans le navigateur. |
| Pages de projets, CV, images et vidéos | Fichiers publiables ; optimiser leur poids et prévoir des URL directement accessibles. |
| Application Python, Streamlit, API, calcul PyTorch à la demande | Pas de serveur d'application fourni par Pages ; héberger ce service ailleurs ou présenter une démonstration enregistrée. |
| Base de données modifiable et envoi d'un formulaire | Nécessitent un service externe ; un lien e-mail peut suffire au contact. |
| API avec clé secrète | La clé ne peut pas être cachée dans les fichiers envoyés au navigateur. Utiliser un service serveur externe si un secret est nécessaire. |
| Données mises à jour | Reconstruire et republier les fichiers, ou charger une API externe compatible avec l'accès depuis le navigateur. |
| Framework avec rendu serveur | Choisir son mode d'export statique ; aucune logique serveur à chaque visite ne peut être exécutée par Pages. |
| Navigation entre projets | Prévoir des fichiers pour les URL ou une navigation cliente adaptée ; vérifier l'ouverture directe et le rechargement de chaque URL. |

Exemple : le visiteur pourra comparer plusieurs backtests pré-calculés et
explorer leurs courbes. Relancer l'entraînement d'une politique RL sur un
serveur depuis le site demanderait un backend externe. REA reste un outil
d'étude local et n'impose aucune technologie au site final.

Limites GitHub documentées au moment du cadrage : site publié de 1 GB maximum,
100 GB/mois de bande passante en limite souple, expiration d'un déploiement
après 10 minutes, et limite souple de 10 builds/heure sauf avec un workflow
GitHub Actions personnalisé. Le dépôt source a une taille recommandée de 1 GB.
Les modèles et les jeux de données complets restent hors du site.

Sources : [fonctionnement de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[création et langages serveur](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site),
[quotas](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
À titre d'exemple, [Next.js documente son export statique et les fonctions exclues](https://nextjs.org/docs/app/guides/static-exports) ; ce framework n'est pas choisi à ce stade.

## Décisions laissées à l'étude REA

Arborescence, composition de l'accueil, typographie, palette, interactions,
stack et méthode de publication. Les choix devront servir la lecture des
projets et l'accès au CV, tout en conservant l'ambition visuelle des références.
