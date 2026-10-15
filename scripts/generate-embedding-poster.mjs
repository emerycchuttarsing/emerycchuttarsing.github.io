import { writeFile } from 'node:fs/promises';
import {
  EMBEDDING_COLORS as C,
  embeddingFrame,
} from '../src/scene/embedding-space.ts';

const frame = embeddingFrame(0);
const line = ({ a, b }) =>
  `M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1200" viewBox="0 0 1536 960">
<title>TinyStories — an embedding neighbourhood</title>
<desc>Simple story words in an illustrative three-dimensional semantic space. Dog is near cat, cat is near whiskers. Positions are hand-placed, not extracted from trained embeddings.</desc>
<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="${C.background}"/><stop offset="1" stop-color="${C.bottom}"/></linearGradient></defs>
<path d="M0 0H1536V960H0Z" fill="url(#bg)"/>
<g text-anchor="middle"><text x="768" y="81" fill="${C.muted}" font-family="monospace" font-size="18">LANGUAGE, IN SPACE</text>
<text x="768" y="146" fill="${C.text}" font-family="Georgia, serif" font-size="56">TinyStories</text>
<text x="768" y="186" fill="${C.muted}" font-family="sans-serif" font-size="22">An embedding neighbourhood</text>
<text x="768" y="916" fill="${C.muted}" font-family="monospace" font-size="16">ILLUSTRATIVE EMBEDDING SPACE</text></g>
<path d="${frame.lines.map(line).join('')}" fill="none" stroke="${C.grid}" stroke-opacity=".28"/>
${frame.links.map((link) => `<path d="${line(link)}" fill="none" stroke="${link.a.color}" stroke-width="${link.main ? 1.8 : 1}" opacity="${link.main ? 0.52 : 0.25}"/>`).join('')}
${frame.nodes.map((n) => `<g fill="${n.color}" opacity="${n.alpha}"><circle cx="${n.x}" cy="${n.y}" r="${(n.main ? 18 : 12) * n.scale}" opacity=".1"/><circle cx="${n.x}" cy="${n.y}" r="${(n.main ? 4 : 3) * n.scale}"/><text x="${n.x}" y="${n.y - 17}" text-anchor="middle" font-family="sans-serif" font-size="${n.fontSize}" font-weight="${n.main ? 500 : 400}" stroke="${C.bottom}" stroke-width="7" stroke-linejoin="round" paint-order="stroke">${n.word}</text></g>`).join('')}
</svg>\n`;
await writeFile(
  new URL('../public/media/scene/tinystories-transformer.svg', import.meta.url),
  svg,
);
console.log(
  'Generated TinyStories poster from the initial embedding camera pose.',
);
