import assert from 'node:assert/strict';
import { orbitReveal } from '../src/scene/reveal.ts';

assert.deepEqual(orbitReveal(1), { radius: 1, scale: 1, angle: 0 });
assert.deepEqual(orbitReveal(2), orbitReveal(1));
assert.deepEqual(orbitReveal(-1), orbitReveal(0));
const entry = orbitReveal(0.3);
assert.ok(entry.radius < 0.35, 'First visible panels start on a compact orbit');
assert.ok(
  entry.angle < -2,
  'A visible scroll-driven turn remains during entry',
);
let previous = orbitReveal(0);
for (let i = 1; i <= 1000; i++) {
  const pose = orbitReveal(i / 1000);
  assert.ok(pose.radius >= previous.radius && pose.radius <= 1);
  assert.ok(pose.scale >= previous.scale && pose.scale <= 1);
  assert.ok(pose.angle >= previous.angle && pose.angle <= 0);
  assert.ok(pose.radius - previous.radius < 0.002, 'Continuous expansion');
  assert.ok(pose.angle - previous.angle < 0.005, 'No angular jumps');
  previous = pose;
}
// Easing rejoins the full-size ambient orbit without a discontinuity.
const nearEnd = orbitReveal(1 - 1e-6);
assert.ok(1 - nearEnd.radius < 1e-10);
assert.ok(Math.abs(nearEnd.angle) < 1e-10);
console.log(
  'Verified compact entry, continuous expansion/rotation and a smooth final orbit.',
);
