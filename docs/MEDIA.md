# Médias et interactions du jalon 4

## Ressources livrées

Les posters SVG du jalon 2 restent les visuels immédiats et les replis des sept
projets. Les trois projets principaux utilisent désormais les animations
procédurales décrites ci-dessous. Les anciens MP4 restent archivés :

| Fichier dans `public/media/` | Contenu conceptuel                 |           Taille |
| ---------------------------- | ---------------------------------- | ---------------: |
| `rl-path-signatures.mp4`     | Ancien visuel, désormais inutilisé | 1 227 282 octets |
| `signature-deep-hedging.mp4` | Ancien visuel, désormais inutilisé | 1 089 419 octets |
| `music-recommendation.mp4`   | Ancien visuel, désormais inutilisé |   297 931 octets |

Total : **2 614 632 octets**. Chaque boucle dure six secondes, en 1536 × 960 à
24 images/s, H.264, pixels `yuv420p`, sans piste audio, avec les métadonnées MP4
placées au début du fichier (`faststart`). Ces dessins n’utilisent aucune donnée
expérimentale, aucun résultat financier et aucun média propriétaire des références.
Leur statut conceptuel est indiqué dans l’aperçu et les études.

## Remplacement

1. Déposer la vidéo dans `public/media/`, avec un nom sans espace.
2. Renseigner `video: '/media/nom.mp4'` dans la fiche Markdown correspondante.
3. Conserver `poster.src`, `poster.alt` et `poster.caption` : ils servent avant
   chargement, quand la lecture est arrêtée ou quand la vidéo est indisponible.
4. Adapter les légendes si un futur média montre une démonstration réelle ou des
   résultats vérifiés. La mention conceptuelle n’est pas un substitut au protocole.
5. Exécuter `npm run verify`, puis la recette navigateur des interactions.

Retirer le champ `video` désactive la lecture de ce projet tout en conservant son
aperçu statique. Aucun composant ne contient une deuxième liste éditable des
sources vidéo. Les études et l’index gardent leurs posters statiques.

## Reproduire les boucles provisoires

Le générateur déterministe est `scripts/generate-motion-previews.py`. Il utilise
Pillow pour les dessins et FFmpeg/libx264 pour l’encodage. Ces outils de création
ne sont pas des dépendances du site et ne sont pas exécutés lors du build.

```bash
python3 scripts/generate-motion-previews.py
# Si FFmpeg n’est pas sur PATH :
FFMPEG=/chemin/vers/ffmpeg python3 scripts/generate-motion-previews.py
```

Le dessin est calculé à 2304 × 1440 puis réduit avec un filtre Lanczos avant
encodage H.264 CRF 18, pour préserver les courbes fines. Pillow avec
`Image.Resampling.LANCZOS` est nécessaire. Les fichiers MP4 sont versionnés et directement servis par
GitHub Pages ; aucun service vidéo externe ni API fictive n’est utilisé.

## Réglages et responsabilités

- `src/scene/config.ts` : poses, durées caméra/apparition, profondeur, éclairage,
  maximum de lectures simultanées et ratio de pixels.
- `src/scene/media.ts` : éligibilité, priorité à la sélection, observateurs de
  visibilité, pause utilisateur, préférences et erreurs de lecture.
- `src/scene/selection.ts` : dialogue, clavier, focus et historique navigateur.
- `src/scene/renderer.ts` : interpolation, lumière d’accent et textures vidéo.
- `src/components/ProjectPreview.astro` et `src/styles/preview.css` : composition et
  commandes de l’aperçu. Les titres et résumés viennent toujours de la collection.
- `src/scene/orbit.ts` : rotation et freinage ; le bouton Pause motion agit aussi
  sur les vidéos. Le flou des faces est géré par `panel-material.ts` et les mipmaps
  des textures vidéo ; les sources HD restent inchangées.

La sélection n’ajoute pas d’URL publique : elle ajoute une entrée d’historique
à URL inchangée. Retour la ferme, Avancer la restaure. Le partage et l’accès direct
continuent à utiliser les URLs des études.

## Médias de l’exposition Works

`scenePoster` désigne une version sans légendes intégrées, adaptée au recadrage
vertical. `poster` conserve la figure légendée de l’étude. Les trois MP4 locaux
ont aussi leurs annotations retirées ; leur statut conceptuel reste dans le
dialogue et les études. Aucun résultat scientifique n’est ajouté.

`src/data/media-colors.json` contient des moyennes de pixels lumineux calculées
hors ligne à deux échantillons par seconde. Le shader utilise les couleurs
interpolées selon le temps des vidéos, en espace linéaire. Les accents servent
de secours. Après remplacement des vidéos, exécuter `scripts/prepare-scene-assets.py`
avec Python standard et FFmpeg (`FFMPEG` permet d’indiquer le binaire).

Les `works-still-*.webp` sont des captures de notre scène en pause, sans la
couche de textes HTML. Chaque format dispose de versions 1× et 2× sélectionnées
par `picture/srcset`. `scripts/capture-works-stills.mjs` prépare les PNG à DPR 2
dans `test-results/works-stills` ; convertir en WebP qualité 95 et produire la
version 1× par réduction Lanczos. Les faces SVG gardent leur viewBox original
mais déclarent 1920 × 1200 pour leur rasterisation WebGL.
Ce sont des médias locaux originaux, utilisés avant chargement et dans les replis.

## Courbe Bitcoin au survol

La fiche RL utilise `sceneAnimation: bitcoin-price`, sans champ `video`.
`bitcoin-path.ts` construit les mouvements et `bitcoin-texture.ts` dessine un
canvas de 1536 × 960, injecté dans la scène existante à une cadence cible de
60 images/s. Le curseur doit rester sur la ligne du projet ou sur son visuel
dans le dialogue. La sortie fige la courbe ; l’entrée reprend sa progression.
Le bouton Pause, les préférences et la visibilité conservent leur priorité.

Les tendances ont une durée moyenne de 3 s, avec 60 % de hausses et 40 % de
baisses. Elles résultent uniquement des amplitudes de petits mouvements
(2/s en moyenne, directions marginales 50/50, intervalles irréguliers).
Le texte indique explicitement qu’il s’agit d’un prix simulé.

```bash
node scripts/check-bitcoin-path.mjs
node scripts/generate-bitcoin-poster.mjs
```

Le second script régénère `public/media/scene/rl-path-signatures.svg` à partir
de l’état initial de l’animation. `scenePosterAlt` décrit ce visuel indépendamment
de la figure pédagogique de l’étude. Le préparateur des autres médias préserve
ce SVG ; les anciennes captures composites Works restent des vues générales
de secours, antérieures au remplacement du panneau Bitcoin.

## Couverture dynamique au survol

La fiche Deep Hedging utilise `sceneAnimation: hedge-rebalancing`, sans vidéo.
Sur fond anthracite, le prix gris défile au-dessus d'une position verte en
paliers. Les points reliés marquent les rééquilibrages, espacés de 0,9 à 2,3 s.
La fenêtre couvre 14 s ; le dessin vise 60 images/s uniquement au survol.
Il reprend sans rattraper le temps passé hors survol. Pause, visibilité et
préférences de mouvement utilisent les contrôles existants de la galerie.

Le prix et la règle de couverture sont des illustrations déterministes,
indépendantes du modèle et des résultats du projet. La légende de l'aperçu
l'indique. Le poster SVG partage exactement le même état initial.

```bash
node scripts/check-hedging-animation.mjs
node scripts/generate-hedging-poster.mjs
```

Le générateur général des médias préserve tous les posters `sceneAnimation`.

## Notes musicales triées au survol

La fiche Spotify utilise `sceneAnimation: music-sorting`, sans vidéo. Sur fond
sauge, 16 notes suivent les connexions d'un grand réseau vert à trois couches.
Les notes noires rejoignent la sortie playlist ; les grises arrivent à une
seconde sortie. Les notes restent sur les connexions, sans dérive libre. Il s'agit
d'une métaphore visuelle du classement pour une playlist, sans résultat de modèle.

Le flux dure 12 s, vise 60 images/s et se fige hors survol. Le bouton Pause,
la visibilité et les préférences de mouvement conservent leur priorité.
Le cadrage central reste lisible sur les panneaux verticaux de la galerie.
Le SVG de repli partage les positions initiales de l'animation.

```bash
node scripts/check-music-animation.mjs
node scripts/generate-music-poster.mjs
```
