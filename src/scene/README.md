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
- `postprocessing.ts`: RenderPass, restrained UnrealBloomPass, vignette, OutputPass.
  Text stays in HTML above the canvas. Mobile omits bloom. Transparent hero/reveal
  uses direct rendering; the settled dark scene uses the effects chain.
  Its half-float targets explicitly enable up to 4 supported MSAA samples;
  the canvas antialias flag alone does not apply to these offscreen targets.
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
retains native title links, an explicit Preview button, Escape, focus trapping,
scroll preservation and Back/Forward history including reload and study return.

`media.ts` schedules at most two videos, one in constrained/mobile/Safari profiles.
Overview eligibility combines section visibility with projected panel visibility;
hidden source video elements are not intersection targets. Hover/focus media
priority has a cancellable 120 ms delay and does not invoke modal selection.
Selection separately reparents the chosen source video into the dialog.

The gallery’s Pause motion control freezes rotation and videos, showing sharp
stills. Leaving a row resumes the slow orbit; keyboard focus has priority over
pointer hover. Active panels sharpen and brighten, while other panels dim smoothly.
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
