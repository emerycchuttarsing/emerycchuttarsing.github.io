import assert from 'node:assert/strict';
import {
  createHedgeFrame,
  illustrativePrice,
} from '../src/scene/hedging-path.ts';
import {
  createHedgeTextureCanvas,
  hedgeCoordinates,
} from '../src/scene/hedging-texture.ts';

let previous = createHedgeFrame(0);
let adjustments = 0;
for (let i = 1; i <= 6000; i++) {
  const current = createHedgeFrame(i / 60);
  assert.ok(
    Math.abs(current.price - previous.price) < 0.08,
    'Smooth price evolution',
  );
  assert.ok(current.position >= 0 && current.position <= 1, 'Bounded holding');
  assert.ok(
    current.events.every((event) => event.time <= current.end),
    'Only observed events',
  );
  const latest = current.events.at(-1);
  assert.equal(
    current.position,
    latest.position,
    'Hold position until the next rebalance',
  );
  assert.equal(
    latest.price,
    illustrativePrice(latest.time),
    'Rebalance uses the contemporaneous price',
  );
  if (current.position !== previous.position) {
    adjustments++;
    assert.ok(
      latest.time > previous.end,
      'A change requires a new rebalance event',
    );
  }
  const geometry = hedgeCoordinates(current);
  assert.ok(
    [...geometry.price, ...geometry.position].every(
      (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
    ),
  );
  previous = current;
}
assert.ok(
  adjustments > 50 && adjustments < 75,
  'Occasional, clearly separated rebalances',
);

const context = new Proxy(
  {
    createLinearGradient: () => ({ addColorStop() {} }),
  },
  { get: (target, key) => target[key] ?? (() => {}) },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
globalThis.Path2D = class {
  moveTo() {}
  lineTo() {}
  closePath() {}
};
const pacing = [];
for (const refresh of [60, 120, 144]) {
  const animation = createHedgeTextureCanvas();
  animation.tick(0, true);
  for (let i = 1; i <= refresh * 10; i++)
    animation.tick((i * 1000) / refresh, true);
  assert.ok(
    Math.abs(animation.frames - 600) <= 1,
    'Target 60 fps at each display refresh rate',
  );
  assert.ok(
    Math.abs(animation.elapsed - 10) < 0.02,
    'Elapsed time independent of display cadence',
  );
  const still = { elapsed: animation.elapsed, frames: animation.frames };
  animation.stop();
  assert.equal(animation.running, false);
  animation.tick(30000, false);
  animation.tick(60000, true);
  assert.deepEqual(
    { elapsed: animation.elapsed, frames: animation.frames },
    still,
    'No catch-up after hover leave or pause',
  );
  pacing.push({ refresh, frames: animation.frames });
  animation.dispose();
  assert.equal(animation.canvas.width, 1);
}
console.log(JSON.stringify({ adjustments, pacing }, null, 2));
