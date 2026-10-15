import assert from 'node:assert/strict';
import {
  EMBEDDING_WORDS,
  EMBEDDING_DURATION,
  embeddingFrame,
} from '../src/scene/embedding-space.ts';
import { createEmbeddingTextureCanvas } from '../src/scene/embedding-texture.ts';

const position = (name) =>
  EMBEDDING_WORDS.find((n) => n.word === name).position;
const distance = (a, b) =>
  Math.hypot(...position(a).map((v, i) => v - position(b)[i]));
assert.ok(distance('dog', 'cat') < distance('dog', 'whiskers'));
assert.ok(distance('cat', 'whiskers') < distance('dog', 'whiskers'));
const original = JSON.stringify(EMBEDDING_WORDS);
let previous = embeddingFrame(0);
for (let i = 1; i <= EMBEDDING_DURATION * 60; i++) {
  const frame = embeddingFrame(i / 60);
  for (const n of frame.nodes) {
    assert.ok(
      Number.isFinite(n.x) && Number.isFinite(n.y) && Number.isFinite(n.scale),
    );
    assert.ok(
      n.x - n.word.length * n.fontSize * 0.29 > 390 &&
        n.x + n.word.length * n.fontSize * 0.29 < 1146,
      'Labels remain in portrait crop',
    );
    assert.ok(n.y > 250 && n.y < 850, 'Space between title and footer');
    assert.ok(n.alpha > 0 && n.alpha <= 1);
    const p = previous.nodes.find((p) => p.word === n.word);
    assert.ok(Math.hypot(n.x - p.x, n.y - p.y) < 2, 'Smooth camera movement');
  }
  previous = frame;
}
assert.equal(
  JSON.stringify(EMBEDDING_WORDS),
  original,
  'Camera movement does not move embeddings',
);
assert.deepEqual(
  embeddingFrame(0),
  embeddingFrame(EMBEDDING_DURATION),
  'Seamless orbit',
);
const context = new Proxy(
  { createLinearGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => target[key] ?? (() => {}) },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
for (const refresh of [60, 120, 144]) {
  const animation = createEmbeddingTextureCanvas();
  animation.tick(0, true);
  for (let i = 1; i <= refresh * 5; i++)
    animation.tick((i * 1000) / refresh, true);
  assert.ok(Math.abs(animation.frames - 300) <= 1, '60 Hz drawing cap');
  assert.ok(
    Math.abs(animation.elapsed - 5) < 0.02,
    'Refresh-independent speed',
  );
  const before = [animation.elapsed, animation.frames];
  animation.stop();
  animation.tick(30000, false);
  animation.tick(60000, true);
  assert.deepEqual(
    [animation.elapsed, animation.frames],
    before,
    'No paused-time catchup',
  );
  animation.dispose();
  assert.equal(animation.tick(70000, true), false);
  assert.equal(animation.running, false);
  assert.equal(animation.canvas.width, 1);
}
console.log(
  'Embedding animation: semantic layout, smooth orbit, crop, 60 Hz pacing, pause and disposal verified.',
);
