import assert from 'node:assert/strict';
import {
  musicFrame,
  MUSIC_DURATION,
  MUSIC_PARTICLES,
} from '../src/scene/music-flow.ts';
import { createMusicTextureCanvas } from '../src/scene/music-texture.ts';

let previous = musicFrame(0);
for (let i = 1; i <= 1440; i++) {
  const frame = musicFrame(i / 60);
  assert.equal(frame.length, MUSIC_PARTICLES, 'Bounded particle count');
  for (const note of frame) {
    assert.ok(Number.isFinite(note.x) && Number.isFinite(note.y));
    assert.ok(
      note.x >= 400 && note.x <= 1150 && note.y >= 180 && note.y <= 860,
      'Portrait-safe composition',
    );
    assert.ok(note.alpha >= 0 && note.alpha <= 1);
    if (note.phase > 0.88) {
      assert.ok(
        note.selected ? note.x < 750 : note.x > 900,
        'Selected and rejected tracks reach separate exits',
      );
    }
    const before = previous[note.id];
    if (note.phase > before.phase) {
      assert.ok(
        Math.hypot(note.x - before.x, note.y - before.y) < 7,
        'Continuous particle movement',
      );
    } else {
      assert.ok(
        note.alpha < 0.08 && before.alpha < 0.08,
        'Wrap only while faded out',
      );
    }
  }
  previous = frame;
}
assert.deepEqual(
  musicFrame(0),
  musicFrame(MUSIC_DURATION),
  'Seamless repeating state',
);

const context = new Proxy(
  { createLinearGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => target[key] ?? (() => {}) },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
globalThis.Path2D = class {};
for (const refresh of [60, 120, 144]) {
  const animation = createMusicTextureCanvas();
  animation.tick(0, true);
  for (let i = 1; i <= refresh * 5; i++)
    animation.tick((i * 1000) / refresh, true);
  assert.ok(Math.abs(animation.frames - 300) <= 1, '60 Hz drawing cap');
  assert.ok(
    Math.abs(animation.elapsed - 5) < 0.02,
    'Cadence-independent elapsed time',
  );
  const still = [animation.elapsed, animation.frames];
  animation.stop();
  animation.tick(30000, false);
  animation.tick(60000, true);
  assert.deepEqual(
    [animation.elapsed, animation.frames],
    still,
    'Resume without catching up paused time',
  );
  animation.dispose();
  assert.equal(animation.running, false);
  assert.equal(animation.canvas.width, 1);
}
console.log(
  'Music flow: bounded, continuous, separate outputs, 60 Hz pacing and pause/resume verified.',
);
