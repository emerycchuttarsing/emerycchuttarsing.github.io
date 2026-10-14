// Shared mathematical landscape. Decorative, not fitted to experimental data.
export function terrainHeight(x: number, z: number) {
  const hill = (cx: number, cz: number, sx: number, sz: number) =>
    Math.exp(-(((x - cx) / sx) ** 2) - ((z - cz) / sz) ** 2);
  return (
    3.8 * hill(-6, -1, 4, 4) +
    2.6 * hill(5, 2, 3.5, 4.3) +
    1.4 * hill(11, -5, 3.3, 3) -
    1.2 * hill(0, 0, 3.6, 3.3) -
    0.6 * hill(-12, 4, 4, 3)
  );
}
export const groundHeight = (x: number, z: number) =>
  terrainHeight(x, z) * 0.24 +
  0.35 * Math.exp(-(((x + 2) / 3.5) ** 2) - ((z - 5.5) / 2.8) ** 2) +
  0.3 * Math.exp(-(((x - 5) / 4) ** 2) - ((z - 4) / 3) ** 2) +
  0.025 * Math.sin(z * 2.3 + x * 0.35);
