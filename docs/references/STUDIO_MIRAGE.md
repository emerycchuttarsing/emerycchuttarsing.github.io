# Studio Mirage — mise en scène des projets

Étude du 13 octobre 2026 (PDT ; 14 octobre UTC). Nouvelle référence créative proposée par Emeryc.
Statut : parcours ciblé observé ; moteur, panneaux, caméra, shaders et lumière désormais documentés dans la [fiche 3D complémentaire](STUDIO_MIRAGE_3D.md).

## Périmètre

- [Accueil](https://studiomirage.io/) : introduction puis navigation entre Renault Trucks et Omnicell Explorer.
- [Our works](https://studiomirage.io/works) : liste de projets et ouverture/fermeture des filtres.
- [Renault Trucks](https://studiomirage.io/works/renault-trucks) : entrée de la page et lecture de sa structure dans le navigateur.
- Vue ordinateur : 1440 × 900 pour la galerie, l'index et la page projet ; première vue d'accueil à 1280 × 720.
- Vue étroite : accueil à 390 × 844, sans débordement horizontal mesuré à cet état. Aucun téléphone physique testé.
- REA 6.4.0 : amorçage public puis 18 modules JavaScript de la scène. Voir le [journal REA](REA_PILOT_2026-10-13.md) pour la couverture partielle et les limites.

## Observé

L'introduction fait émerger le nom au centre d'un volume sombre entouré de lumière. Le bouton d'exploration conduit à une galerie spatiale : des panneaux monumentaux, portant les images ou vidéos des projets, occupent un paysage de dunes. Le projet actif porte un titre central très lisible, un lien de visite, et des commandes précédent/suivant nommant les projets voisins.

Le passage Renault Trucks → Omnicell Explorer a été effectué et les libellés comme le panneau actif ont changé. La galerie donne une impression de déplacement dans une exposition. Le rôle des images est majeur : chaque projet possède une identité visuelle immédiate.

La page Our works offre une seconde voie de lecture. Les réalisations sont disposées en lignes, avec nom, types de prestation et secteur. Les filtres distinguent ces deux dimensions. Le décor de la galerie reste perceptible en arrière-plan : la continuité visuelle ne dépend donc pas seulement d'un fondu entre pages.

La page Renault Trucks prolonge son grand visuel avant de passer à une étude de cas : résumé, année, technologie, rôle, prix, problème, stratégie, processus, expérience, adaptation aux écrans, résultats, témoignage et contributions. Plusieurs vidéos de cette page ont été signalées comme illisibles dans le navigateur d'étude ; leur lecture n'est pas validée.

En largeur 390 px, l'accueil conserve l'objet central et ses repères Paris/Dubai, avec navigation en haut et appel au défilement en bas. Cela confirme cette composition à cette largeur, pas la qualité de tout le parcours tactile.

## Confirmé techniquement

- **SvelteKit** : `__sveltekit_157aiho`, imports de `entry/start.XrJOhQV7.js` et `entry/app.wSI8DMXa.js`, hydratation de la page à partir de données déjà présentes dans le HTML.
- **Contenus Prismic** : données de projets structurées, titres, catégories, liens et URL de médias Prismic dans le script d'amorçage. Ce constat ne documente pas tout le backend.
- **Variantes de médias** : champs distincts `thumbnail_video` et `thumbnail_video_mobile` dans les données publiées.
- **Ressources effectivement inventoriées par le navigateur** : modèle `Mirage_scene_03.Cdl4Dhyd.glb`, décodeur Draco/WASM, ressources `color-timelines`, vidéos, fichier audio, polices PP Pangram Sans.
- **REA ciblé** : 1 fichier d'amorçage, 184 346 octets UTF-8, 0 erreur de parsing ; deux dépendances par import dynamique identifiées.

Les premières réponses HTTP 403 ont été suivies de téléchargements réussis avec des en-têtes de requête explicites. Three.js r182, Threlte et GSAP 3.14.2 sont maintenant confirmés dans les modules. Les panneaux instanciés, la caméra, le shader du sol et les couleurs synchronisées avec les vidéos sont détaillés dans la [fiche technique 3D](STUDIO_MIRAGE_3D.md). La stack Vue.js du projet Renault Trucks ne décrit pas celle du portfolio Mirage.

## Paramètres à définir dans notre version

| Dimension | Adaptation proposée |
| --- | --- |
| Galerie | Les sept projets ensemble ; trois panneaux plus grands et quatre plus compacts, tous sélectionnables |
| Visuels | Trajectoires et signatures pour le capstone ; pertes et couverture pour Deep Hedging ; réseau de recommandations pour Spotify |
| Profondeur | Scène 3D à cadrage ouvert ; lumière, matières et caméra inspirées de Mirage ; intensité à tester |
| Information | Problème traité, méthodes et lien vers l'étude immédiatement associés au visuel |
| Palette | Continuité ivoire/graphite avec l'accueil d'Ing Tian ; accents peu nombreux |
| Index | Liste accessible de tous les projets ; catégories quant/ML/data si elles facilitent réellement le choix |
| Mobile | Cartes ou panneaux simplifiés, liens persistants, aucun contenu essentiel dépendant du survol |
| Cas détaillés | Grand visuel introductif, puis protocole, contribution, résultats vérifiés et limites |

## Jugement pour notre portfolio

La galerie principale doit montrer tous les projets dès sa vue d'ensemble, conformément à la précision d'Emeryc. Les trois phares se distinguent par leur taille et leur présence. Un index éditorial complémentaire reste utile. Le même aperçu peut accompagner le rapprochement de caméra puis l'ouverture de son étude de cas.

La scène complète avec dunes, portail et ambiance sonore est très liée à l'identité de l'agence. Pour Emeryc, le contenu scientifique peut fournir sa propre matière visuelle. L'éclairage, la profondeur et le rythme nous intéressent davantage que la reprise littérale de ce décor.

Les ralentissements rencontrés durant les sessions d'analyse simultanées ne sont pas une mesure des performances du site en conditions normales. Un budget d'animation et des essais sur téléphone seront nécessaires pour notre éventuelle version.

## Complément REA approfondi

La [nouvelle analyse](STUDIO_MIRAGE_REA_DEEP.md) récupère les graphes auparavant
exclus et détaille, avec quatre extraits ciblés, les états de caméra, le budget
vidéo, le cache, l'alignement DOM/3D et la qualité adaptative. Une capture REA en
exécution a également réussi sur l'accueil pendant son chargement. Elle confirme
la structure et certaines ressources ; elle ne remplace pas un parcours visuel
complet. La [fiche 3D](STUDIO_MIRAGE_3D.md) intègre ces nouveaux paramètres.
