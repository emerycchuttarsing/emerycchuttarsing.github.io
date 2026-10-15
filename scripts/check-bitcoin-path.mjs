import assert from 'node:assert/strict';
import {
  createPriceRegime,
  createPricePath,
  seededRandom,
} from '../src/scene/bitcoin-path.ts';
import { createBitcoinTextureCanvas } from '../src/scene/bitcoin-texture.ts';

const random = seededRandom(73091);
let upRegimes = 0,
  totalTime = 0,
  moveCount = 0,
  upMoves = 0;
let smallestInterval = Infinity,
  largestInterval = 0;
const regimes = 30_000;
for (let i = 0; i < regimes; i++) {
  const regime = createPriceRegime(random);
  const net = regime.moves.reduce((sum, move) => sum + move.delta, 0);
  assert.equal(
    Math.sign(net),
    regime.direction,
    'Amplitudes must produce the chosen trend',
  );
  assert.ok(
    Math.abs(
      regime.moves.reduce((sum, move) => sum + move.duration, 0) -
        regime.duration,
    ) < 1e-10,
  );
  upRegimes += Number(regime.direction > 0);
  totalTime += regime.duration;
  for (const move of regime.moves) {
    moveCount++;
    upMoves += Number(move.delta > 0);
    smallestInterval = Math.min(smallestInterval, move.duration);
    largestInterval = Math.max(largestInterval, move.duration);
  }
}
assert.ok(Math.abs(upRegimes / regimes - 0.6) < 0.01, '60% upward regimes');
assert.equal(upMoves / moveCount, 0.5, 'Balanced micro-movement directions');
assert.ok(
  Math.abs(totalTime / regimes - 3) < 0.02,
  'Three-second mean trend duration',
);
assert.ok(
  Math.abs(moveCount / totalTime - 2) < 0.02,
  'Two moves per second on average',
);
assert.ok(largestInterval / smallestInterval > 5, 'Irregular event timing');

const a = createPricePath(seededRandom(81));
const b = createPricePath(seededRandom(81));
for (let i = 0; i < 600; i++) a.advance(1 / 60);
b.advance(10);
assert.ok(
  Math.abs(a.snapshot().price - b.snapshot().price) < 1e-9,
  'Price evolution is independent of rendering frame rate',
);
const still = a.snapshot();
a.advance(0);
assert.deepEqual(a.snapshot(), still, 'No elapsed time means no movement');
const continuity = createPricePath(seededRandom(6));
let last = continuity.snapshot().price,
  maxStep = 0;
for (let i = 0; i < 10_000; i++) {
  continuity.advance(1 / 600);
  const current = continuity.snapshot().price;
  maxStep = Math.max(maxStep, Math.abs(current - last));
  last = current;
}
assert.ok(maxStep < 0.03, 'No discontinuity at micro or macro boundaries');
assert.ok(continuity.snapshot().samples.every((p) => Number.isFinite(p.price)));
// Exercise the animation clock without needing a GPU or inspecting pixels.
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
  const animation = createBitcoinTextureCanvas();
  animation.tick(0, true);
  for (let i = 1; i <= refresh * 10; i++)
    animation.tick((i * 1000) / refresh, true);
  assert.ok(
    Math.abs(animation.frames - 600) <= 1,
    '60 updates/s on different refresh rates',
  );
  const frozen = { frames: animation.frames, elapsed: animation.elapsed };
  animation.tick(11000, false);
  animation.tick(30000, false);
  assert.deepEqual(
    { frames: animation.frames, elapsed: animation.elapsed },
    frozen,
    'No updates off hover',
  );
  animation.tick(60000, true);
  assert.equal(
    animation.elapsed,
    frozen.elapsed,
    'Resume must not catch up time spent paused',
  );
  pacing.push({
    refresh,
    frames: animation.frames,
    elapsed: animation.elapsed,
  });
  animation.dispose();
  assert.equal(animation.canvas.width, 1, 'Release canvas storage');
}
console.log(
  JSON.stringify(
    {
      regimes,
      upProbability: upRegimes / regimes,
      microUpProbability: upMoves / moveCount,
      meanRegimeSeconds: totalTime / regimes,
      movesPerSecond: moveCount / totalTime,
      smallestInterval,
      largestInterval,
      maxStep,
      pacing,
    },
    null,
    2,
  ),
);
