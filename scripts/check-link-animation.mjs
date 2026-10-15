import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  LINK_EDGES,
  LINK_NODES,
  LINK_CIRCLES,
} from '../src/scene/link-network.ts';
import {
  LINK_ROUTE,
  LINK_CYCLE_SECONDS,
  LINK_ACTIVE_COLOR,
  LINK_VISITED_COLOR,
  linkSignalFrame,
} from '../src/scene/link-signal.ts';
import { createLinkTextureCanvas } from '../src/scene/link-texture.ts';

const original = await readFile(
  new URL('../public/media/scene/link-prediction.svg', import.meta.url),
  'utf8',
);
assert.equal(
  LINK_CIRCLES.length,
  [...original.matchAll(/<circle\s/g)].length,
  'Original circles preserved',
);
for (const e of LINK_EDGES) {
  const a = LINK_NODES[e.a],
    b = LINK_NODES[e.b];
  assert.ok(
    original.includes(
      `M${a.x.toFixed(2)},${a.y.toFixed(2)} L${b.x.toFixed(2)},${b.y.toFixed(2)}`,
    ),
    'Every animated connection comes from the original poster',
  );
}
for (let i = 0; i < LINK_ROUTE.length; i++) {
  const s = LINK_ROUTE[i],
    next = LINK_ROUTE[(i + 1) % LINK_ROUTE.length];
  assert.deepEqual(
    s.to,
    next.from,
    'Adjacent edges share the same node, including the loop seam',
  );
  const crossing = s.start + s.duration;
  const before = linkSignalFrame(crossing - 1e-5).pulse,
    after = linkSignalFrame(crossing + 1e-5).pulse;
  assert.ok(
    Math.hypot(after.x - before.x, after.y - before.y) < 0.001,
    'No teleport at a node',
  );
}
const first = LINK_ROUTE[0];
const active = linkSignalFrame(first.duration * 0.5).edges.find(
  (e) => e.active,
);
assert.deepEqual(active.color, [...LINK_ACTIVE_COLOR]);
const exited = linkSignalFrame(first.duration + 0.6).edges.find(
  (e) => e.edge === first.edge,
);
assert.deepEqual(
  exited.color,
  [...LINK_VISITED_COLOR],
  'Visited edge becomes red',
);
assert.equal(
  linkSignalFrame(0).pulse.alpha,
  0,
  'Original still on initial load',
);
for (let i = 0; i < LINK_CYCLE_SECONDS * 120; i++) {
  const frame = linkSignalFrame(i / 60),
    pulse = frame.pulse,
    e = LINK_EDGES[pulse.edge];
  const a = LINK_NODES[e.a],
    b = LINK_NODES[e.b];
  assert.ok(
    Math.abs((pulse.x - a.x) * (b.y - a.y) - (pulse.y - a.y) * (b.x - a.x)) <
      1e-7,
    'Signal stays on an existing edge',
  );
  for (const trail of frame.edges)
    assert.ok(trail.alpha >= 0 && trail.alpha <= 0.9);
}
// Repeated edges are composited oldest-first, retaining fading red below orange.
for (const s of LINK_ROUTE) {
  const t = s.start + LINK_CYCLE_SECONDS;
  const prior = linkSignalFrame(t - 1e-6).edges.filter(
    (e) => e.edge === s.edge,
  );
  const next = linkSignalFrame(t + 1e-6).edges.filter((e) => e.edge === s.edge);
  const opacity = (edges) =>
    edges.reduce((sum, e) => sum + (1 - sum) * e.alpha, 0);
  assert.ok(
    Math.abs(opacity(prior) - opacity(next)) < 0.001,
    'No opacity jump when revisiting an edge',
  );
}
const context = new Proxy(
  {
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  },
  { get: (t, k) => t[k] ?? (() => {}) },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
globalThis.Path2D = class {};
for (const refresh of [60, 120, 144]) {
  const a = createLinkTextureCanvas();
  a.tick(0, true);
  for (let i = 1; i <= refresh * 3; i++) a.tick((i * 1000) / refresh, true);
  assert.ok(Math.abs(a.frames - 180) <= 1, '60 Hz cap');
  assert.ok(
    Math.abs(a.elapsed - 3) < 0.02,
    'Consistent speed across refresh rates',
  );
  const still = [a.elapsed, a.frames];
  a.stop();
  a.tick(30000, false);
  a.tick(60000, true);
  assert.deepEqual(
    [a.elapsed, a.frames],
    still,
    'No time catchup after hover ends',
  );
  a.dispose();
  assert.equal(a.tick(70000, true), false);
  assert.equal(a.running, false);
}
console.log(
  'Original topology, continuous connected walk, orange/red transition, revisit fades, 60 Hz cap and pause/resume verified.',
);
