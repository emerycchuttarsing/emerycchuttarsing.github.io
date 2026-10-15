import assert from 'node:assert/strict';
import {
  VISION_TILES,
  VISION_STATE_SECONDS,
  visionTileFrame,
} from '../src/scene/vision-mosaic.ts';
import { createVisionTextureCanvas } from '../src/scene/vision-texture.ts';

const cycleFrames = Math.ceil(3 * VISION_STATE_SECONDS * 60);

// Test the visible blend, including wraparound, instead of just its phase index.
const weights = (time, tile) => {
  const { from, to, blend } = visionTileFrame(time, tile);
  const result = [0, 0, 0];
  result[from] += 1 - blend;
  result[to] += blend;
  return result;
};
for (let tile = 0; tile < VISION_TILES.length; tile++) {
  for (let step = 3; step < 9; step++) {
    const boundary = step * VISION_STATE_SECONDS - VISION_TILES[tile].offset;
    const before = weights(boundary - 1e-5, tile);
    const after = weights(boundary + 1e-5, tile);
    assert.ok(
      before.every((v, i) => Math.abs(v - after[i]) < 1e-6),
      'Crossfade stays continuous at state and loop boundaries',
    );
  }
  const visited = new Set();
  for (let i = 0; i <= cycleFrames; i++) {
    const time = i / 60;
    const frame = visionTileFrame(time, tile);
    visited.add(frame.label);
    assert.ok(frame.blend >= 0 && frame.blend <= 1);
    assert.ok(
      Math.abs(weights(time, tile).reduce((a, b) => a + b) - 1) < 1e-10,
      'No brightness dip during a fade',
    );
  }
  assert.equal(visited.size, 3, 'Each region visits all three representations');
}
for (let i = 0; i < cycleFrames; i++) {
  assert.ok(
    new Set(VISION_TILES.map((_, t) => visionTileFrame(i / 60, t).label)).size >
      1,
    'Tiles never all show the same state',
  );
}

const context = new Proxy(
  { createLinearGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => target[key] ?? (() => {}) },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
globalThis.Path2D = class {};
globalThis.Image = class {
  set src(_) {
    queueMicrotask(() => this.onload?.());
  }
};
for (const refresh of [60, 120, 144]) {
  const animation = createVisionTextureCanvas();
  assert.equal(
    animation.tick(0, true),
    false,
    'Wait for images before drawing',
  );
  assert.equal(await animation.ready, true);
  animation.tick(0, true);
  for (let i = 1; i <= refresh * 3; i++)
    animation.tick((i * 1000) / refresh, true);
  assert.ok(
    Math.abs(animation.frames - 180) <= 1,
    '60 fps cap on high-refresh displays',
  );
  assert.ok(
    Math.abs(animation.elapsed - 3) < 0.02,
    'Timing independent of refresh rate',
  );
  const still = [animation.elapsed, animation.frames];
  animation.stop();
  animation.tick(30000, false);
  animation.tick(60000, true);
  assert.deepEqual(
    [animation.elapsed, animation.frames],
    still,
    'Pause and hover resume without jumping',
  );
  animation.dispose();
  assert.equal(animation.tick(70000, true), false);
  assert.equal(animation.running, false);
}
const disposedDuringLoad = createVisionTextureCanvas();
disposedDuringLoad.dispose();
assert.equal(
  await disposedDuringLoad.ready,
  false,
  'Late image loads cannot revive a disposed canvas',
);
globalThis.Image = class {
  set src(_) {
    queueMicrotask(() => this.onerror?.());
  }
};
const failed = createVisionTextureCanvas();
assert.equal(
  await failed.ready,
  false,
  'Image failure leaves the static poster available',
);
assert.equal(failed.tick(0, true), false);
failed.dispose();
console.log(
  'Three states, staggered phases, continuous crossfades, 60 fps cap, pause/resume and image-load failure handling verified.',
);
