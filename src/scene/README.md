# Shared portfolio scene — Works correction

Both `/` and `/projects/` progressively enhance the same `ProjectsShowcase` and
`ProjectRows`. Seven native title links remain available before any JavaScript. Once enhanced,
the entire project row opens its preview, including its title and category.
Case studies and About load neither Three.js nor video players.

## Ownership and modes

`mount.ts` collects explicit `SceneElements`: root, section, optional hero, dialog,
preview slot and scene slot. The mode is `home` or `index`; index starts directly
in overview and never measures a missing hero. Generation tickets protect late
imports. Pagehide disposes renderer, highlight, media and selection; a persisted
pageshow creates a fresh set. One document owns one canvas/context.

The journey remains hero → reveal → overview → selected, or fallback. A separate
active project follows the latest keyboard or pointer interaction. Restoring
dialog focus preserves keyboard navigation without overriding subsequent hover.
Hover never opens the modal or changes history.

## Spatial scene

- `height.ts`: a shared sum of Gaussian hills, used by the hero points and the
  continuous ground mesh. This is a decorative landscape, not research data.
- `terrain.ts`: original point-cloud hero. Position, scale and opacity approach
  the ground coordinate system during the reversible reveal.
- `reveal.ts`: a reversible scroll-driven turn, expanding from 28% to 100% of
  the orbital radius while cards grow from 55% to full size. Ambient rotation
  starts during the reveal, before the project section fills the viewport.
- `layout.ts`: deterministic world positions by project ID, own orientations,
  depths and scales on an elliptical orbit. Three featured panels are larger.
  Panels have grown by about 50% and can overlap in depth. The seven native HTML
  links remain visible and independently usable. Compact screens use a tighter orbit.
- `orbit.ts`: 90-second ambient revolution and damped shortest-arc focus targeting.
  Pointer/focus changes preserve velocity; targeted panels settle at the front.
- `panel-material.ts`: derivative-aware mipmap filtering and a soft sampling kernel
  blur image faces while drifting. Focus and explicit previews use the sharp level.
  Frames, ground and HTML are never blurred. Video textures generate mipmaps.
- `ground.ts`: indexed surface with normals, fine spatial grain/ripples, seven
  attenuated colored light contributions and edge fading.
- `lighting.ts`: samples local precomputed sRGB video-color curves, converts to
  linear light and interpolates by currentTime. Accents serve as still fallbacks.
- `postprocessing.ts`: one full-resolution HDR/MSAA scene target, quarter-resolution
  Gaussian glow and a combined vignette/OutputPass. Only geometry uses up to four
  supported MSAA samples. Text stays in HTML; mobile omits glow. Transparent
  hero/reveal uses direct rendering; settled dark scenes use the effects pipeline.
- `renderer.ts`: camera interpolation, projected visibility, panel materials,
  finite highlight/selection transitions and complete GPU cleanup.
- `config.ts`: camera poses, point density, lights, timing, DPR and media budget.

Works uses an 18° desktop camera; distance expands when needed to fit the world
layout. A view offset follows native document scroll. Only the explicit dialog
uses DOM alignment: the selected panel advances into its measured media slot.
The same canvas joins the native dialog top layer and returns to its scene root.

Rendering uses up to DPR 2 at every breakpoint, bounded by 8,388,608 drawing
pixels on very large displays. Ground grain and ripples fade below a pixel
using shader derivatives, avoiding noisy undersampling in the distance.
Scene posters rasterize at 1920 × 1200; video sources are 1536 × 960.

## HTML, selection and media

`highlight.ts` binds pointer/focus to IDs and the separator glow. `selection.ts`
enhances title links into accessible dialog triggers and opens the preview from
any click on a row. The explicit Preview button, Enter/Space activation, Escape,
focus restoration, scroll preservation and Back/Forward history remain supported.
The case-study link stays inside the dialog; native title hrefs are retained for
no-JS access.

`media.ts` schedules at most two videos, one in constrained/mobile/Safari profiles.
Overview eligibility combines section visibility with projected panel visibility;
hidden source video elements are not intersection targets. Hover/focus media
priority has a cancellable 120 ms delay and does not invoke modal selection.
Selection separately reparents the chosen source video into the dialog.

The gallery’s Pause motion control freezes rotation and videos, showing sharp
stills. Leaving the list after pointer interaction resumes the slow orbit.
Keyboard navigation follows focus; moving the pointer switches back to hover. Active rows receive a faint accent wash and 10% brighter content;
other rows retain 76% content opacity. These changes fade over 300 ms, without
changing layout, and CSS transitions are disabled for reduced motion. Active
panels sharpen and brighten slightly; others retain 82% of their normal opacity.
Frame edges and the matching ground light use the same restrained emphasis.
The orbit stops in the explicit preview and when its panels leave the viewport.

Videos have no src initially. Muted autoplay refusal offers manual retry; errors
retain posters. Pause, Save-Data, reduced motion and document visibility are
respected. Video frames request renders via requestVideoFrameCallback. The visible
orbit schedules animation frames while drifting or settling; it schedules no
frames once paused, hidden, offscreen, or settled on a static project. Reduced
motion uses the static HTML fallback. No timer continues an invisible orbit.

## Fallbacks and resources

A responsive picture of our own rendered scene is shown before textures are ready,
without JS/WebGL, after context loss and with reduced motion. Seven links and the
Featured hierarchy survive. With JS, the dialog remains usable without WebGL.
The mobile fallback retains the same dark exhibition and natural HTML list.
Each desktop/tablet/mobile still has a 2× srcset candidate for Retina screens.

Disposal cancels listeners, observers, timers and video callbacks; restores moved
videos; disposes every texture, material, geometry and postprocessing render target;
and removes the canvas/context. DOM diagnostics expose projected panel bounds and
renderer.info.memory for the browser validation script, without global mutable APIs.

See `docs/validation/mirage-correction/README.md` for evidence and limitations.

## Performance du rendu orbital

`postprocessing.ts` rend une seule fois la géométrie dans une cible HDR MSAA
à pleine résolution. Deux textures à un quart de la largeur et de la hauteur
reçoivent le halo, filtré horizontalement puis verticalement. La composition,
la vignette et la conversion des couleurs partagent la passe de sortie.
Le buffer MSAA peut être abandonné après résolution : aucune passe ne réécrit
dedans pour mélanger la lumière. L’image résolue reste disponible jusqu’à la
composition finale. Les trois cibles et leurs matériaux sont libérés à la sortie.

Le renderer regroupe les cinq faces de cadre en un seul dessin, masque les
points du hero lorsqu’ils sont transparents, mesure les sections sur scroll ou
resize et évite les mutations DOM identiques. Les diagnostics géométriques
sont publiés au plus dix fois par seconde pendant la rotation ; les changements
d’état et la dernière pose restent publiés immédiatement. La caméra et
l’orbite continuent d’être mises à jour à chaque frame.

Mesures et commande reproductible :
[validation de performance](../../docs/validation/orbit-performance/README.md).

## Procedural project panels

`SceneProject.animation` selects a `bitcoin-price`, `hedge-rebalancing` or `music-sorting` CanvasTexture instead of a
video. `bitcoin-path.ts` contains the pure stochastic path and `bitcoin-texture.ts`
its drawing and 60 Hz pacing. `renderer.ts` advances it from the existing scene
loop while the panel is visible and motion is enabled. In the gallery, only the
pointer-hovered project row animates; keyboard focus and touch retain a still.
An open preview animates automatically, regardless of pointer position or input
method. Gallery pointer leave and preview close stop playback; the shared pause,
page visibility and reduced-motion preferences still apply. No independent timer
keeps running.
Canvas pixels, the texture and listeners are disposed with the scene.

The media manager receives procedural project IDs solely to retain the shared
pause controls and preference messages. Other projects' video scheduling is
unchanged. The generated SVG supplies the initial and no-WebGL project preview.
DOM diagnostics `data-price-motion`, `data-price-time` and `data-price-frames`
allow checking hover gating and update rate without an exposed mutable API.

The hedging panel uses `hedging-path.ts` and `hedging-texture.ts`: a smooth grey
illustrative price and green piecewise-constant holdings, with irregular
rebalancing events and a brief pulse on each adjustment. The simple reactive
holding rule is decorative, not the trained policy or a live market feed.
`generate-hedging-poster.mjs` shares its initial geometry for the static fallback.
Both panels use the same hover, pause and visibility gates. Hedging diagnostics
use `data-hedge-motion`, `data-hedge-time` and `data-hedge-frames`; the existing
Bitcoin diagnostic attributes remain independent.

The music panel uses `music-flow.ts` and `music-texture.ts`. Sixteen notes
follow visible connections through a large three-layer decorative network, then
arrive at black playlist and grey alternative output nodes. A sage background keeps
the notes legible; its material exposure stays below the gallery bloom threshold.
The 12-second flow targets 60 Hz through the same hover and visibility gates.
`generate-music-poster.mjs` uses the same initial note positions for the SVG.
`data-music-motion`, `data-music-time` and `data-music-frames` report its state.
The illustration represents matching a playlist, not observed model predictions.
