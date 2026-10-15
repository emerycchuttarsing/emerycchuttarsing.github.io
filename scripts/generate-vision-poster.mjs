import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import {
  VISION_STATES,
  VISION_TILES,
  VISION_TILE_SIZE,
  visionTileFrame,
} from '../src/scene/vision-mosaic.ts';

const root = new URL('../public/', import.meta.url);
// Display-only color maps: the original saved Sobel/LBP values are unchanged.
// Lift low-contrast edges and soften the bright LBP view for the dark gallery.
for (const [name, low, high, gain] of [
  ['edges', [11, 22, 20], [157, 204, 185], 3.2],
  ['texture', [14, 25, 23], [145, 166, 153], 1],
]) {
  const { data, info } = await sharp(
    new URL(`media/visual-learning/${name}.png`, root).pathname,
  )
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    const t = Math.min(1, (data[i] / 255) * gain);
    for (let channel = 0; channel < 3; channel++)
      data[i + channel] = Math.round(
        low[channel] + t * (high[channel] - low[channel]),
      );
  }
  await sharp(data, { raw: info })
    .webp({ lossless: true })
    .toFile(new URL(`media/scene/vision-${name}.webp`, root).pathname);
}
const uris = await Promise.all(
  VISION_STATES.map(async ({ src }) => {
    // librsvg supports embedded PNG reliably; the browser assets remain WebP.
    const data = await sharp(new URL(src.slice(1), root).pathname)
      .png()
      .toBuffer();
    return `data:image/png;base64,${data.toString('base64')}`;
  }),
);
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="960" viewBox="0 0 960 600">
<defs><linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="240" y1="0" x2="700" y2="600"><stop stop-color="#202f2c"/><stop offset="1" stop-color="#0b1413"/></linearGradient></defs>
<rect width="960" height="600" fill="url(#bg)"/>
<text x="480" y="55" text-anchor="middle" font-family="monospace" font-size="14" fill="#9fb7ab">SATELLITE IMAGE ANALYSIS</text>
<text x="480" y="101" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="#e3e9de">Visual Learning</text>
<path d="M250 158V126h32M678 126h32v32M250 554v32h32M678 586h32v-32" fill="none" stroke="#a5b4a4" stroke-opacity=".15"/>`;
for (const [index, tile] of VISION_TILES.entries()) {
  const frame = visionTileFrame(0, index);
  const state = VISION_STATES[frame.label];
  svg += `<svg x="${tile.x}" y="${tile.y}" width="${VISION_TILE_SIZE}" height="${VISION_TILE_SIZE}" viewBox="${tile.sx} ${tile.sy} 185 185">
  <image href="${uris[frame.from]}" width="370" height="370"/>
  <image href="${uris[frame.to]}" width="370" height="370" opacity="${frame.blend}"/></svg>
  <rect x="${tile.x}" y="${tile.y + 174}" width="208" height="34" fill="#0a1514" fill-opacity=".91"/>
  <circle cx="${tile.x + 15}" cy="${tile.y + 191}" r="3" fill="${state.color}"/>
  <text x="${tile.x + 28}" y="${tile.y + 196}" font-family="sans-serif" font-size="15" fill="${state.color}">${state.label}</text>
  <text x="${tile.x + 194}" y="${tile.y + 196}" text-anchor="end" font-family="monospace" font-size="10" fill="#9baca2">${state.detail}</text>
  <rect x="${tile.x}" y="${tile.y}" width="208" height="208" fill="none" stroke="#c2d4c8" stroke-opacity=".18" stroke-width=".8"/>`;
}
await writeFile(
  new URL('media/scene/visual-learning-mosaic.webp', root),
  await sharp(Buffer.from(svg + '</svg>'))
    .webp({ quality: 94 })
    .toBuffer(),
);
console.log(
  'Saved gallery poster and two display-tinted feature maps. Source notebook images unchanged.',
);
