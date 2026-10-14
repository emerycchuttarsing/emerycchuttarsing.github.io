# Recette du jalon 4 — Interactivité, états et médias

Vérification locale du **14 octobre 2026**, dans Chrome **155.0.8059.79**,
sur `http://127.0.0.1:4321/`. Branche : `codex/portfolio`.
Aucune publication publique ni connexion API nécessaire au parcours retenu.

## Livré

- Défilement natif avec interpolation du terrain, de la caméra et de l’apparition
  des sept panneaux : `hero`, `reveal`, `overview`, puis `selected` et `fallback`.
- Aperçu de chaque projet avec panneau agrandi, couleur d’accent, résumé,
  commande de retour et lien vers l’étude. Les titres de la galerie restent
  des liens directs vers les études.
- Dialogue natif, focus, Tab/Shift+Tab, Échap et historique Retour/Avancer.
- Trois boucles conceptuelles originales pour les phares, sans résultats
  scientifiques ajoutés. Générateur et remplacements décrits dans [MEDIA.md](../../MEDIA.md).
- Sources vidéo chargées à la demande, budget de lecture, pause explicite,
  interruption hors champ et en onglet masqué, repli poster en cas d’échec.
- Une seule scène et un seul canvas, réutilisés dans l’aperçu puis restaurés.

## Vérifications

`npm run verify` réussit : formatage conforme, **40 fichiers contrôlés par Astro
Check**, zéro erreur, avertissement ou hint ; **onze routes** construites et
**238 références internes** validées. Le build conserve l’avertissement connu
sur la taille du bundle Three.js, importé seulement sur l’accueil.

`scripts/check-interactions-browser.mjs` contrôle les quatre dimensions et
**22 scénarios** détaillés dans [report.json](report.json) :

| Dimension  | Galerie                                               | Lectures simultanées maximales observées | Aperçu                               |
| ---------- | ----------------------------------------------------- | ---------------------------------------: | ------------------------------------ |
| 1440 × 900 | Sept panneaux et titres dans l’écran                  |                                        2 | Panneau 3D et texte en deux colonnes |
| 1280 × 800 | Sept projets accessibles, sans débordement horizontal |                                        2 | Panneau 3D et texte en deux colonnes |
| 768 × 1024 | Grille HTML dans le défilement                        |                                        1 | Image/vidéo HTML, contenu empilé     |
| 390 × 844  | Une colonne dans le défilement                        |                                        1 | Image/vidéo HTML, contenu empilé     |

À 1440 × 900, les sept panneaux et titres occupent environ **212 à 828 px** de
hauteur, identiquement au cadrage du jalon 3.

### Parcours et clavier

- Progression intermédiaire de révélation puis vue d’ensemble ; remontée vers
  l’état hero vérifiée aux quatre dimensions.
- Ouverture et fermeture des sept aperçus, activation par Entrée, cycle de focus
  dans le dialogue, Échap, restauration du bouton d’origine.
- Position de défilement conservée à la fermeture, aux quatre dimensions.
- Retour ferme l’aperçu ; Avancer le restaure ; un rechargement conserve la sélection.
- Visite d’une étude depuis l’aperçu puis retour : dialogue et scène restaurés.
  Les liens directs des titres fonctionnent aussi.
- Un seul canvas après sélection, retour, navigation et changement de préférence.

### Médias, repos et replis

- Aucun `src` vidéo attribué dans le premier écran : pas de téléchargement vidéo
  avant son éligibilité. Deux lectures maximum en mode desktop, une en compact.
- Progression réelle du temps de la vidéo sélectionnée ; toutes les autres en pause.
- Budget d’une lecture également vérifié avec profils Safari et mobile à grande
  largeur simulés dans Chrome.
- Pause/reprise explicite, sortie de la galerie, masquage du document simulé et
  vidéo sortie de la zone visible d’un dialogue court.
- Aucun nouveau RAF demandé au repos après arrêt des vidéos et fin des transitions.
- Mouvement réduit : pas de canvas, pas de source vidéo ; les aperçus HTML restent
  utilisables. Le changement de préférence en cours de navigation est couvert.
- Save-Data : aucune source vidéo attribuée, contenu conservé.
- Autoplay refusé : poster et commande Play previews ; reprise manuelle testée.
- Vidéo indisponible : poster et message lisible ; accès à l’étude conservé.
- WebGL indisponible ou perdu pendant une sélection : canvas retiré et repli HTML
  sans fermer le dialogue ni perdre son accès à l’étude.
- JavaScript désactivé : boutons d’aperçu cachés, sept liens HTML et études accessibles.
- Aucune exception JavaScript de page relevée pendant la recette.

Les essais ont permis de corriger le cycle clavier du dialogue, la dernière
étape d’interpolation lorsque les vidéos sont arrêtées, ainsi que la gestion des
lectures pendant les sélections rapides. Le cadre du terrain sélectionné a aussi
été stabilisé indépendamment du projet et de la position de défilement.

Le navigateur intégré a également servi à ouvrir l’aperçu Spotify et à confirmer
son résumé, ses commandes et le lien de l’étude.

## Captures conservées

- [Accueil à 1440 × 900](hero-1440x900.png)
- [Passage du terrain aux panneaux](reveal-1440x900.png)
- [Sept projets en vue d’ensemble](gallery-1440x900.png)
- [Aperçu 3D à 1440 × 900](selected-1440x900.png)
- [Aperçu 3D à 1280 × 800](selected-1280x800.png)
- [Aperçu à 768 × 1024](selected-768x1024.png)
- [Aperçu à 390 × 844](selected-390x844.png)
- [Sans WebGL](no-webgl.png)
- [Mouvement réduit](reduced-motion.png)
- [Vidéo indisponible](video-error.png)
- [Perte du contexte pendant la sélection](context-loss.png)

Les autres captures de l’exécution restent dans `test-results/jalon-4`, ignoré
par Git. Les recettes historiques des jalons 2 et 3 sont conservées.

## Portée des essais

Les dimensions mobiles, le profil Safari, Save-Data, le refus d’autoplay et
l’onglet masqué ont été simulés dans Chrome. Il ne s’agit pas d’un essai natif
Safari, Firefox ou d’un téléphone physique ; cette recette finale reste au jalon 5.
Les erreurs média et WebGL sont des scénarios injectés volontairement.

Les vidéos sont des illustrations de six secondes en H.264, muettes, 768 × 480
à 24 images/s, pour **531 078 octets** au total. Leurs informations de format ont
été contrôlées avec FFprobe. Les médias définitifs et les résultats expérimentaux
pourront les remplacer dans la collection. Aucun entraînement n’a été relancé.

Commit de contrôle : `feat: complete milestone 4 interactivity`.
