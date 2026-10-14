# Médias et interactions du jalon 4

## Ressources livrées

Les posters SVG du jalon 2 restent les visuels immédiats et les replis des sept
projets. Trois boucles originales les complètent pour les projets phares :

| Fichier dans `public/media/` | Contenu conceptuel                           |           Taille |
| ---------------------------- | -------------------------------------------- | ---------------: |
| `rl-path-signatures.mp4`     | Trajectoires et points parcourant un chemin  | 1 227 282 octets |
| `signature-deep-hedging.mp4` | Surface maillée et déplacement sur le relief | 1 089 419 octets |
| `music-recommendation.mp4`   | Réseau pulsant et onde sonore stylisée       |   297 931 octets |

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
