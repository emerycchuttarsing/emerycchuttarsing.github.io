# Shared portfolio scene

The home page progressively enhances native links and posters. The editorial
pages load neither the renderer nor video players. No API is needed for this
static portfolio: its previews are local conceptual media, not remote inference.

## Modules

- `mount.ts`: owns the selection, media scheduler and optional renderer. It
  disposes them on `pagehide` and restores them on a back/forward-cache return.
  Generation tickets prevent a late dynamic import from creating an orphan scene.
- `selection.ts`: native modal dialog, focus cycle, Escape, explicit close,
  restoration of the trigger focus, and preview history entries. The URL stays
  unchanged; browser Back closes the preview and Forward restores it. Opening a
  case study uses an ordinary link. A reload or return from a study restores a
  selected preview from history state.
- `media.ts`: lazy source assignment, viewport observation, playback budget,
  reduced-motion/data-saving preferences, manual pause/play, error recovery and
  cancellation of pending video-frame callbacks. It runs independently of WebGL.
- `renderer.ts`: one transparent canvas, one scene and one camera, with elapsed-time
  interpolation, DOM-aligned panels, accent lighting and explicit GPU cleanup.
- `terrain.ts`: the decorative mathematical point landscape, shared by the hero,
  gallery and selection. It contains no measured scientific data.
- `config.ts`: camera poses, transition durations, terrain, panel depth/tilt,
  lighting, pixel ratio and video playback limits.
- `types.ts`: serializable project data and renderer lifecycle contract.
- `../lib/projects.ts`: derives browser data from the validated content collection.

## Scroll and selection

Native scrolling drives `hero` → `reveal` → `overview` and the reverse journey.
Progress starts when the gallery enters the bottom 90% of the viewport and ends
when its top reaches the viewport top. The camera and panel fades approach this
progress with separate durations. Interpolation uses elapsed time and snaps to
its final value before stopping; it does not depend on display refresh rate.

At 1440 × 900, the overview retains all seven panels and titles. Clicking the
image's Preview button opens `selected`; clicking a project title still opens
its study directly. The selected panel advances and grows into the dialog's
measured media slot, while the other panels fade and the rim light takes the
project's accent color. Closing returns it to its original HTML anchor.

The **same canvas** moves into the dialog's scene container while it is open,
then returns to the home scene root. There is no second renderer or WebGL context.
The native dialog supplies modal semantics; a small explicit Tab/Shift+Tab cycle
keeps focus among its commands. Escape and the visible back command restore the
previous trigger without scrolling the gallery.

Below 1100 px wide or 800 px high, panels and selected media use HTML posters and
videos. The terrain remains optional. The dialog stacks on compact/short screens
and scrolls naturally. No interaction relies on hover.

## Video budget and rendering

Three featured projects have original six-second conceptual loops. Videos start
with `preload="none"` and no `src`; a source is assigned only when eligible to play.
The scheduler allows two simultaneous videos on desktop and one in a compact
viewport or a mobile/Safari user-agent profile. Selection pauses the other videos and
prioritizes the selected one. A video outside the viewport, including inside a
scrolled dialog, pauses. Hidden documents pause every video and scene request.

Muted inline looping is requested, never assumed to succeed. Autoplay refusal
leaves a still image and a Play previews command; a media error preserves its
poster. Pause previews returns the panels to their posters. Reduced motion and
Save-Data prevent automatic video downloads and playback. Reduced motion also
skips Three.js, while the HTML selection remains usable.

The renderer requests frames only for a finite transition, a layout change, a
texture load or a new playing-video frame. `requestVideoFrameCallback` drives
video updates where available; a cancellable RAF fallback covers older engines.
No scene loop runs when media are paused and the scene has settled.

## Fallbacks and cleanup

HTML images appear before textures are ready. Missing WebGL or context loss
removes the canvas and restores HTML media without closing a selected preview.
Texture-loading failure keeps the HTML panel layer. Without JavaScript, preview
buttons stay hidden and all seven original case-study links work normally.

Disposal removes interaction/media events and observers, cancels RAF and video
callbacks, pauses and unloads sources, restores moved video elements, disposes
textures/geometries/materials, and releases the WebGL context. Lifecycle listeners
remain only to restore the page when its own document returns from browser cache.

See `docs/MEDIA.md` for replacing media and `docs/validation/jalon-4/README.md` for
the interaction recipe. Final physical-device/browser and performance tuning
remain part of milestone 5.
