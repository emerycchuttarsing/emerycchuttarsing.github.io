// Scroll opens a compact carousel into the final orbit. Both ends ease to rest,
// so scrolling back up reverses the same path without resetting the idle spin.
export function orbitReveal(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - 0.18) / 0.82));
  const open = t * t * (3 - 2 * t);
  return {
    radius: 0.28 + open * 0.72,
    scale: 0.55 + open * 0.45,
    angle: (open - 1) * Math.PI * 0.85,
  };
}
