# Shared portfolio scene — Works correction

Both `/` and `/projects/` progressively enhance the same `ProjectsShowcase` and
`ProjectRows`. Seven native title links remain available before any JavaScript.
Case studies and About load neither Three.js nor video players.

## Ownership and modes

`mount.ts` collects explicit `SceneElements`: root, section, optional hero, dialog,
preview slot and scene slot. The mode is `home` or `index`; index starts directly
in overview and never measures a missing hero. Generation tickets protect late
imports. Pagehide disposes renderer, highlight, media and selection; a persisted
pageshow creates a fresh set. One document owns one canvas/context.

The journey remains hero → reveal → overview → selected, or fallback. A separate
active project identifies the row under keyboard focus or the pointer. Focus has
priority, and hover never opens the modal or changes history.

## Spatial scene

- `height.ts`: a shared sum of Gaussian hills, used by the hero points and the
  continuous ground mesh. This is a decorative landscape, not research data.
- `terrain.ts`: original point-cloud hero. Position, scale and opacity approach
  the ground coordinate system during the reversible reveal.
- `layout.ts`: deterministic world positions by project ID, own orientations,
  depths and scales. Three featured panels are larger. No overview panel follows
  a row's bounding rectangle. Compact screens use a tighter spatial arrangement.
- `ground.ts`: indexed surface with normals, fine spatial grain/ripples, seven
  attenuated colored light contributions and edge fading.
- `lighting.ts`: samples local precomputed sRGB video-color curves, converts to
  linear light and interpolates by currentTime. Accents serve as still fallbacks.
- `postprocessing.ts`: RenderPass, restrained UnrealBloomPass, vignette, OutputPass.
  Text stays in HTML above the canvas. Mobile omits bloom. Transparent hero/reveal
  uses direct rendering; the settled dark scene uses the effects chain.
- `renderer.ts`: camera interpolation, projected visibility, panel materials,
  finite highlight/selection transitions and complete GPU cleanup.
- `config.ts`: camera poses, point density, lights, timing, DPR and media budget.

Works uses an 18° desktop camera; distance expands when needed to fit the world
layout. A view offset follows native document scroll. Only the explicit dialog
uses DOM alignment: the selected panel advances into its measured media slot.
The same canvas joins the native dialog top layer and returns to its scene root.

## HTML, selection and media

`highlight.ts` binds pointer/focus to IDs and the separator glow. `selection.ts`
retains native title links, an explicit Preview button, Escape, focus trapping,
scroll preservation and Back/Forward history including reload and study return.

`media.ts` schedules at most two videos, one in constrained/mobile/Safari profiles.
Overview eligibility combines section visibility with projected panel visibility;
hidden source video elements are not intersection targets. Hover/focus media
priority has a cancellable 120 ms delay and does not invoke modal selection.
Selection separately reparents the chosen source video into the dialog.

Videos have no src initially. Muted autoplay refusal offers manual retry; errors
retain posters. Pause, Save-Data, reduced motion and document visibility are
respected. Video frames request renders via requestVideoFrameCallback; no ambient
shader animation keeps an idle loop alive. Paused stable scenes stop rendering.

## Fallbacks and resources

A responsive picture of our own rendered scene is shown before textures are ready,
without JS/WebGL, after context loss and with reduced motion. Seven links and the
Featured hierarchy survive. With JS, the dialog remains usable without WebGL.
The mobile fallback retains the same dark exhibition and natural HTML list.

Disposal cancels listeners, observers, timers and video callbacks; restores moved
videos; disposes every texture, material, geometry and postprocessing render target;
and removes the canvas/context. DOM diagnostics expose projected panel bounds and
renderer.info.memory for the browser validation script, without global mutable APIs.

See `docs/validation/mirage-correction/README.md` for evidence and limitations.
