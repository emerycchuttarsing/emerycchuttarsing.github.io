# Médias et interactions du jalon 4

## Ressources livrées

Les posters SVG du jalon 2 restent les visuels immédiats et les replis des sept
projets. Trois boucles originales les complètent pour les projets phares :

| Fichier dans `public/media/` | Contenu conceptuel                           |         Taille |
| ---------------------------- | -------------------------------------------- | -------------: |
| `rl-path-signatures.mp4`     | Trajectoires et points parcourant un chemin  | 231 999 octets |
| `signature-deep-hedging.mp4` | Surface maillée et déplacement sur le relief | 208 502 octets |
| `music-recommendation.mp4`   | Réseau pulsant et onde sonore stylisée       |  90 577 octets |

Total : **531 078 octets**. Chaque boucle dure six secondes, en 768 × 480 à
24 images/s, H.264, pixels `yuv420p`, sans piste audio, avec les métadonnées MP4
placées au début du fichier (`faststart`). Ces dessins n’utilisent aucune donnée
expérimentale, aucun résultat financier et aucun média propriétaire des références.
Ils sont identifiés comme conceptuels dans le visuel et dans l’aperçu.

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

Une version récente de Pillow prenant en charge `ImageFont.load_default(size=…)`
est nécessaire. Les fichiers MP4 sont versionnés et directement servis par
GitHub Pages ; aucun service vidéo externe ni API fictive n’est utilisé.

## Réglages et responsabilités

- `src/scene/config.ts` : poses, durées caméra/apparition, profondeur, éclairage,
  maximum de lectures simultanées et ratio de pixels.
- `src/scene/media.ts` : éligibilité, priorité à la sélection, observateurs de
  visibilité, pause utilisateur, préférences et erreurs de lecture.
- `src/scene/selection.ts` : dialogue, clavier, focus et historique navigateur.
- `src/scene/renderer.ts` : interpolation, lumière d’accent et textures vidéo.
- `src/components/ProjectPreview.astro` et `src/styles/home.css` : composition et
  commandes de l’aperçu. Les titres et résumés viennent toujours de la collection.

La sélection n’ajoute pas d’URL publique : elle ajoute une entrée d’historique
à URL inchangée. Retour la ferme, Avancer la restaure. Le partage et l’accès direct
continuent à utiliser les URLs des études.
