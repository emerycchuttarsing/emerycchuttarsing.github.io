import assert from 'node:assert/strict';
import { RETAIL_CYCLE, retailFrame } from '../src/scene/retail-artwork.ts';
import { createRetailTextureCanvas } from '../src/scene/retail-texture.ts';

// No jump at the long loop seam, and every chart/store value stays in range.
const before = retailFrame(RETAIL_CYCLE - 1e-6);
const after = retailFrame(1e-6);
before.values.forEach((v, i) =>
  assert.ok(Math.abs(v - after.values[i]) < 1e-6),
);
for (let frame = 0; frame < RETAIL_CYCLE * 60; frame++) {
  const state = retailFrame(frame / 60);
  assert.ok(
    [...state.values, ...state.stores].every(
      (v) => Number.isFinite(v) && v > 0 && v < 1,
    ),
  );
  for (const shape of state.shapes) {
    assert.ok(
      shape.opacity === undefined || (shape.opacity >= 0 && shape.opacity <= 1),
    );
    if (shape.kind === 'rect') assert.ok(shape.w > 0 && shape.h > 0);
  }
}
for (const seam of [8, 16, 24]) {
  assert.ok(retailFrame(seam - 1e-5).pulse.opacity < 1e-6);
  assert.ok(retailFrame(seam + 1e-5).pulse.opacity < 1e-6);
}

const context = new Proxy(
  {},
  { get: (target, key) => target[key] ?? (() => {}) },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
globalThis.Path2D = class {
  roundRect() {}
  arc() {}
};
for (const refresh of [60, 120, 144]) {
  const animation = createRetailTextureCanvas();
  animation.tick(0, true);
  for (let i = 1; i <= refresh * 3; i++)
    animation.tick((i * 1000) / refresh, true);
  assert.ok(Math.abs(animation.frames - 180) <= 1, '60 Hz frame cap');
  assert.ok(
    Math.abs(animation.elapsed - 3) < 0.02,
    'Refresh-independent speed',
  );
  const frozen = [animation.frames, animation.elapsed];
  animation.stop();
  animation.tick(30000, false);
  animation.tick(60000, true);
  assert.deepEqual(
    [animation.frames, animation.elapsed],
    frozen,
    'No catch-up when resuming hover',
  );
  animation.dispose();
  assert.equal(animation.tick(70000, true), false);
  assert.equal(animation.running, false);
}
console.log(
  'Verified continuous loop, bounded values, 60 Hz pacing and exact hover pause/resume.',
);
