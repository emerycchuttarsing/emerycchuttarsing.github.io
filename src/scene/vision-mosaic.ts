export const VISION_STATES = [
  {
    label: 'Original',
    detail: 'RGB',
    color: '#b4c8ad',
    src: '/media/visual-learning/satellite.png',
  },
  {
    label: 'Edges',
    detail: 'SOBEL',
    color: '#91c6bc',
    src: '/media/scene/vision-edges.webp',
  },
  {
    label: 'Texture',
    detail: 'LBP',
    color: '#c4bca0',
    src: '/media/scene/vision-texture.webp',
  },
] as const;

// Four aligned regions of the same satellite scene and its saved feature maps.
// The central composition remains visible when the gallery crops to portrait.
export const VISION_TILES = [
  { x: 266, y: 142, sx: 0, sy: 0, offset: 0 },
  { x: 486, y: 142, sx: 185, sy: 0, offset: 1.53 },
  { x: 266, y: 362, sx: 0, sy: 185, offset: 3.06 },
  { x: 486, y: 362, sx: 185, sy: 185, offset: 4.14 },
] as const;
export const VISION_TILE_SIZE = 208;
export const VISION_STATE_SECONDS = 1.8;
export const VISION_FADE_SECONDS = 1.08;

export function visionTileFrame(seconds: number, tile: number) {
  const time = Math.max(0, seconds) + VISION_TILES[tile]!.offset;
  const step = Math.floor(time / VISION_STATE_SECONDS);
  const within = time - step * VISION_STATE_SECONDS;
  const fade = Math.min(
    1,
    Math.max(
      0,
      (within - (VISION_STATE_SECONDS - VISION_FADE_SECONDS)) /
        VISION_FADE_SECONDS,
    ),
  );
  // Zero slope at both ends prevents a visible hitch at the loop boundary.
  const blend = fade * fade * (3 - 2 * fade);
  const from = step % VISION_STATES.length;
  const to = (from + 1) % VISION_STATES.length;
  return { from, to, blend, label: blend < 0.5 ? from : to };
}
