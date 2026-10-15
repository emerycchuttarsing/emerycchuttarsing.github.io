import { writeFile } from 'node:fs/promises';
import { createPricePath } from '../src/scene/bitcoin-path.ts';
import {
  PRICE_CANVAS,
  PRICE_PLOT,
  PRICE_COLORS as C,
  priceBounds,
  priceCoordinates,
} from '../src/scene/bitcoin-texture.ts';

const state = createPricePath().snapshot();
const { center, span } = priceBounds(state.samples);
const points = priceCoordinates(state.samples, center, span);
const line = points
  .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
  .join(' ');
const tail = points
  .slice(-41)
  .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
  .join(' ');
const tip = points.at(-1);
const grid = [];
for (let y = PRICE_PLOT.top; y <= PRICE_PLOT.bottom; y += 106)
  grid.push(`<path d="M60 ${y}H1476"/>`);
for (let x = PRICE_PLOT.left; x <= PRICE_PLOT.right; x += 236)
  grid.push(`<path d="M${x} 250V780"/>`);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1200" viewBox="0 0 ${PRICE_CANVAS.width} ${PRICE_CANVAS.height}">
<title>Simulated Bitcoin price path</title>
<desc>Small fluctuations form broader rises and falls. An illustrative path, not market data.</desc>
<defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${C.line}" stop-opacity=".16"/><stop offset="1" stop-color="${C.line}" stop-opacity="0"/></linearGradient></defs>
<path fill="${C.background}" d="M0 0H1536V960H0Z"/>
<g stroke="${C.grid}" fill="none">${grid.join('')}</g>
<g text-anchor="middle" font-family="sans-serif"><text x="768" y="100" font-size="40" fill="${C.muted}">B T C</text><text x="768" y="175" font-size="54" font-family="monospace" fill="${C.text}">$${Math.round(state.price * 640).toLocaleString('en-US')}</text><text x="768" y="865" font-size="18" fill="${C.muted}">SIMULATED PRICE PATH</text></g>
<path d="${line} L1476,780 L60,780 Z" fill="url(#area)"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${line}" stroke="${C.line}" stroke-opacity=".08" stroke-width="16"/><path d="${line}" stroke="${C.line}" stroke-width="3.5"/><path d="${tail}" stroke="${C.accent}" stroke-width="4"/></g>
<circle cx="${tip.x - 3}" cy="${tip.y}" r="5" fill="${C.accent}"/>
</svg>\n`;
await writeFile(
  new URL('../public/media/scene/rl-path-signatures.svg', import.meta.url),
  svg,
);
console.log(
  'Generated the Bitcoin poster from the same initial path as the animation.',
);
