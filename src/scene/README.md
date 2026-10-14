# Shared portfolio scene

Milestone 2 implements the first visual composition with two fixed camera poses.

- `mount.ts`: home-only dynamic import, reduced-motion preference, page lifecycle
  and back/forward cache restoration. A preference change disposes or remounts
  the scene without reloading the page.
- `renderer.ts`: one transparent canvas, one scene, one perspective camera;
  DOM-to-world panel alignment, lighting, textures and explicit resource cleanup.
- `terrain.ts`: 18,281 samples of five Gaussian hills/valleys, a soft circular
  point shader and fading edges. This is a decorative mathematical landscape.
- `config.ts`: camera poses, terrain density, panel depth/tilt, lighting and DPR.
- `types.ts`: serializable project data and lifecycle contract. The reveal and
  selected state types reserve interfaces for milestone 4; those transitions
  are not yet implemented.
- `../lib/projects.ts`: derives scene data from the content collection at build
  time. Filesystem checks and Markdown never enter the client module graph.

## Layout and states

Native scroll selects `overview` when the gallery top crosses the viewport
midline; otherwise the scene uses `hero`. Panels occupy the camera-facing plane
at their HTML anchor positions, with small depth and rotation offsets. The
terrain remains in the same scene, behind the panels.

The seven HTML images stay visible until every texture has loaded and the
first frame has rendered. Panel enhancement requires a viewport of at least
1100 × 800 CSS pixels; compact layouts retain the HTML posters and the terrain.
Reduced motion skips the renderer import entirely. Unsupported WebGL, context
loss and loading failures preserve native links and static poster content.

Rendering is demand-driven: textures, scroll, resize and visibility changes
schedule at most one pending animation frame. No permanent animation loop runs.
The canvas is hidden outside the hero/gallery; hidden documents pause requests.
Disposal cancels pending frames, removes listeners and observers, disposes GPU
resources and restores the HTML images. Late texture loads dispose themselves.

The compact/static terrain illustration is `public/media/terrain.svg`.
Poster images are original procedural SVGs, stored in `public/media/` and
referenced from the Markdown collection. No third-party visual assets are used.

## Next milestones

The animated camera path, panel selection, videos and their media budget remain
for milestone 4. Final device/performance tuning remains for milestone 5.
See `docs/validation/jalon-2/README.md` for the tested viewports and lifecycle cases.
