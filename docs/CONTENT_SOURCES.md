# Contenus du jalon 3

## Périmètre éditorial

Les sept études sont rédigées en anglais à partir du brief préparatoire et d’une
lecture ciblée des sources locales déjà disponibles. Ce jalon ne constitue pas
un audit des expériences : aucun entraînement n’a été relancé et aucun résultat
chiffré n’a été intégré. Les trois phares visent 600–800 mots ; les quatre autres
250–400 mots, hors métadonnées et schéma de méthode.

Les textes distinguent le contexte collectif du travail d’implémentation personnel,
notamment pour le capstone et Spotify. Les évaluations proposées et les limites
sont séparées des mécanismes effectivement présents dans le code.

| Étude              | Sources locales consultées                                                                    | Points retenus                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capstone RL        | `Capstone Project SinFench/base_d3qn` : README, environnements, algorithmes et configurations | Trajectoires et signatures, D3QN/PPO/SAC, comptabilité cash/positions, coûts et validation temporelle                                               |
| Deep Hedging       | `Desktop/223 Final Project /projet.py` et note de projet                                      | Option asiatique arithmétique, GBM, historique brut/signatures, coûts, CVaR ; absence de prime initiale explicitée                                  |
| Spotify            | `242B Final Project Final/242B_final_project` : README, rapport et pipeline                   | ALS → SASRec → MMR, compromis pertinence/diversité, interface, couverture du catalogue, contexte d’équipe                                           |
| TinyStories        | `Desktop/242B Homework 3 /Transformer` : tokenizer, modèle, entraînement et génération        | BPE, Transformer causal, apprentissage et limites de la génération                                                                                  |
| Link Prediction    | `Optimization 240 project/Gradient descent.ipynb`                                             | Embeddings par factorisation, gradients manuels, négatifs et évaluation ; vérifier les négatifs contre l’ensemble des liens connus reste une limite |
| Visual Learning    | `Grad Project Data 100/Milestone 3.ipynb`                                                     | Images satellitaires, caractéristiques visuelles, classification ; un découpage par événement est une proposition d’évaluation                      |
| Retail Forecasting | `Case AKO /data_science_input.ipynb`                                                          | Agrégation mensuelle, retards, CatBoost ; le découpage aléatoire existant est décrit et la validation temporelle proposée comme amélioration        |

Ces chemins sont des repères de développement, pas des liens publiés dans le site.
Les documents préparatoires demeurent conservés dans `docs/`. Les éventuelles
valeurs numériques de leurs analyses ne sont pas reprises dans les études.

## Modifier une étude

La source unique est `src/content/projects/<id>.md` :

- Le nom du fichier définit l’URL ; conserver les sept identifiants et leur ordre.
- `title`, `summary` et `technologies` sont réutilisés dans l’index et l’étude.
- `context` indique le cadre du projet ; `role` décrit le rôle personnel.
- `contributions` fournit les éléments de synthèse de l’en-tête.
- `workflow` contient trois objets `title` / `description` pour le schéma HTML.
- `poster.src`, `poster.alt` et `poster.caption` pilotent le visuel d’ouverture.
  Les fichiers actuels sont dans `public/media/`. Toute future figure de résultats
  devra avoir une légende et une description adaptées, en remplacement de la
  mention conceptuelle actuelle.
- Les liens `links.code`, `links.report` et `links.demo` sont facultatifs. Omettre
  les champs inconnus ; ne pas utiliser une URL factice ou un `#`.
- Le corps Markdown accepte titres `##` et `###`, listes, tableaux et citations
  `>` pour les encadrés méthodologiques. Le sommaire reprend les `##`.
- Une figure dans le corps peut utiliser le HTML natif `<figure>`, `<img>` avec
  `alt`, dimensions et chemin public, puis `<figcaption>` ; `Prose` applique les
  styles de lecture et de légende. Aucun MDX n’est nécessaire.
- Éviter les titres générant les ancres réservées `method-overview` et
  `contributions-title`. Le contrôle de build signale les identifiants dupliqués.
- Conserver `editorialStatus: draft` tant que le texte et ses preuves restent
  provisoires. Les futures valeurs chiffrées nécessitent leur protocole et leurs
  sources ; elles ne sont pas implicites dans ce point de contrôle.

## Parcours et contact

`src/data/site.ts` contient les biographies, les deux expériences, les trois
formations, les quatre groupes de compétences et les coordonnées. Les champs de
`ProfileEntry` sont `date`, `organization`, `location`, `title`, `description`.
La description est une liste de paragraphes.

Le parcours et le téléchargement proviennent du CV fourni :
`/Users/emeryc/Downloads/Emeryc_Chuttarsing_Resume.pdf`.
Les dates et intitulés reprennent ce document. Les descriptions sont reformulées
sans reprendre ses revendications chiffrées dans les études.

Copie publique inchangée :
`public/resume/emeryc-chuttarsing-resume.pdf` — **156 179 octets**.
SHA-256 de la source et de la copie :
`f631314864111a11db84a022e44a49d282e00e0002cfa17fc65a142152a239ba`.

Le lien `site.links.resume` déclenche le téléchargement. L’adresse de contact est
`emeryc.chuttarsing@berkeley.edu`. Le GitHub reprend le profil existant. Le CV ne
contient pas de lien LinkedIn : `site.links.linkedin` reste `null` et n’apparaît
pas dans la page.

## Composants

| Composant           | Fonction                                                      |
| ------------------- | ------------------------------------------------------------- |
| `ProjectHeader`     | Titre, résumé, contexte, rôle, technologies et contributions  |
| `ProjectFigure`     | Poster d’ouverture, alternative et légende                    |
| `TableOfContents`   | Sommaire natif à partir des titres rendus                     |
| `MethodDiagram`     | Étapes de méthode en liste HTML                               |
| `Prose`             | Typographie éditoriale, listes, tableaux, encadrés et figures |
| `ProjectResources`  | Destinations code, rapport et démo renseignées                |
| `ProjectNavigation` | Précédent/suivant sans boucle, index et galerie               |
| `ProfileTimeline`   | Parcours professionnel et formations                          |
| `SkillGroups`       | Compétences regroupées par domaine                            |
| `ProfileLinks`      | CV, GitHub, e-mail et éventuel LinkedIn                       |

L’index réutilise les résumés, technologies, contextes, rôles et ressources de la
collection. Les sept panneaux de l’accueil conservent leur contenu concis.
