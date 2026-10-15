import { writeFile } from 'node:fs/promises';
import { createHedgeFrame } from '../src/scene/hedging-path.ts';
import {
  HEDGE_COLORS as C,
  HEDGE_PLOT as P,
  hedgeCoordinates,
} from '../src/scene/hedging-texture.ts';

const state = createHedgeFrame(0);
const points = hedgeCoordinates(state);
const path = (points) =>
  points
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');
const grid = [];
for (const [top, bottom] of [
  [P.priceTop, P.priceBottom],
  [P.positionTop, P.positionBottom],
]) {
  for (let i = 0; i <= 2; i++)
    grid.push(
      `<path d="M${P.left} ${top + (i / 2) * (bottom - top)}H${P.right}"/>`,
    );
}
const connectors = points.events
  .map(
    (event) =>
      `<path d="M${event.x.toFixed(2)} ${event.priceY.toFixed(2)}V${event.positionY.toFixed(2)}"/>`,
  )
  .join('');
const dots = points.events
  .map(
    (event) =>
      `<circle cx="${event.x.toFixed(2)}" cy="${event.priceY.toFixed(2)}" r="3.5" fill="${C.hedge}"/><circle cx="${event.x.toFixed(2)}" cy="${event.positionY.toFixed(2)}" r="5" fill="${C.accent}"/>`,
  )
  .join('');
const tip = points.price.at(-1);
const latest = points.events.at(-1);
const pulse = state.sinceRebalance / 0.8;
const halo =
  pulse < 1
    ? `<circle cx="${latest.x}" cy="${latest.positionY}" r="${6 + pulse * 21}" stroke="${C.accent}" opacity="${(1 - pulse) * 0.45}" stroke-width="2" fill="none"/>`
    : '';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1200" viewBox="0 0 1536 960">
<title>Illustrative hedge rebalancing</title>
<desc>A grey underlying price curve, with green position adjustments at irregular intervals. Original decorative artwork, not market data or model output.</desc>
<defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${C.hedge}" stop-opacity=".19"/><stop offset="1" stop-color="${C.hedge}" stop-opacity=".012"/></linearGradient></defs>
<path fill="${C.background}" d="M0 0H1536V960H0Z"/>
<g fill="none" stroke="${C.grid}">${grid.join('')}</g>
<g text-anchor="middle" font-family="sans-serif">
<text x="768" y="92" font-size="40" fill="${C.text}">DEEP HEDGING</text>
<text x="768" y="170" font-size="60" font-family="monospace" fill="${C.accent}">${Math.round(state.position * 100)}%</text>
<text x="768" y="207" font-size="18" fill="${C.muted}">HEDGE POSITION</text>
<text x="768" y="257" font-size="22" fill="${C.price}">UNDERLYING · $${state.price.toFixed(2)}</text>
<text x="768" y="610" font-size="22" fill="${C.hedge}">REBALANCE &amp; HOLD</text>
<text x="768" y="887" font-size="18" fill="${C.muted}">ILLUSTRATIVE HEDGE</text></g>
<path d="${path(points.position)} L${P.right} ${P.positionBottom} L${P.left} ${P.positionBottom}Z" fill="url(#area)"/>
<g fill="none" stroke="${C.hedge}" stroke-opacity=".2" stroke-dasharray="3 8">${connectors}</g>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${path(points.price)}" stroke="${C.price}" stroke-width="3"/>
<path d="${path(points.position)}" stroke="${C.hedge}" stroke-width="15" stroke-opacity=".07"/>
<path d="${path(points.position)}" stroke="${C.hedge}" stroke-width="4"/></g>
${dots}${halo}<circle cx="${tip.x - 3}" cy="${tip.y}" r="4.5" fill="${C.text}"/>
</svg>\n`;
await writeFile(
  new URL('../public/media/scene/signature-deep-hedging.svg', import.meta.url),
  svg,
);
console.log(
  'Generated the hedging poster from the same initial state as the animation.',
);
