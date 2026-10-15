import { writeFile } from 'node:fs/promises';
import {
  MUSIC_COLORS as C,
  MUSIC_LAYERS,
  MUSIC_NOTE,
  MUSIC_DOUBLE_NOTE,
  MUSIC_OUTPUTS,
  musicFrame,
  musicNodeActivity,
} from '../src/scene/music-flow.ts';
import { SPOTIFY_ICON_PATH } from '../src/scene/spotify-icon.ts';

const frame = musicFrame(0);
const rules = Array.from(
  { length: 17 },
  (_, i) => `<path d="M340 ${210 + i * 40}H1196"/>`,
).join('');
const edges = MUSIC_LAYERS.slice(0, -1)
  .flatMap((layer, i) =>
    layer.flatMap((a) =>
      MUSIC_LAYERS[i + 1].map(
        (b) => `<path d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`,
      ),
    ),
  )
  .join('');
const entries = MUSIC_LAYERS[0]
  .map((node) => `<path d="M${node.x} 215V${node.y}"/>`)
  .join('');
const exits = MUSIC_LAYERS[2]
  .flatMap((node) =>
    MUSIC_OUTPUTS.map(
      (output, i) =>
        `<path d="M${node.x} ${node.y}L${output.x} ${output.y}" stroke="${i === 0 ? C.green : C.rejected}"/>`,
    ),
  )
  .join('');
const outputs = MUSIC_OUTPUTS.map(
  (output, i) =>
    `<circle cx="${output.x}" cy="${output.y}" r="34" fill="${C.node}" stroke="${i === 0 ? C.green : C.rejected}" stroke-width="2"/>`,
).join('');
const nodes = MUSIC_LAYERS.flatMap((layer, i) =>
  layer.map((n, j) => {
    const a = musicNodeActivity(frame, i, j);
    return `<circle cx="${n.x}" cy="${n.y}" r="${27 + a * 10}" fill="${C.green}" opacity="${a * 0.13}"/><circle cx="${n.x}" cy="${n.y}" r="23" fill="${C.node}" stroke="${C.green}" stroke-width="2.5"/><circle cx="${n.x}" cy="${n.y}" r="${5 + a * 4}" fill="${C.green}"/>`;
  }),
).join('');
const notes = frame
  .map(
    (n) =>
      `<path d="${n.double ? MUSIC_DOUBLE_NOTE : MUSIC_NOTE}" transform="translate(${n.x} ${n.y}) rotate(${(n.rotation * 180) / Math.PI}) scale(${n.scale})" fill="${n.selected ? C.ink : C.rejected}" opacity="${n.alpha}"/>`,
  )
  .join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1200" viewBox="0 0 1536 960">
<title>Spotify Recommander System</title><desc>Illustrative notes passing through a neural network: black notes are selected and grey notes set aside. Decorative artwork, not model output.</desc>
<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="${C.background}"/><stop offset="1" stop-color="${C.backgroundBottom}"/></linearGradient></defs>
<path d="M0 0H1536V960H0Z" fill="url(#bg)"/>
<g fill="none" stroke="${C.edge}" stroke-opacity=".125">${rules}</g>
<rect x="626" y="46" width="58" height="58" rx="8" fill="#101a15"/>
<path d="${SPOTIFY_ICON_PATH}" transform="translate(632 52) scale(${46 / 240})" fill="#1ed760"/>
<g text-anchor="middle" font-family="sans-serif">
<text x="804" y="94" fill="${C.ink}" font-size="48">Spotify</text>
<text x="768" y="143" fill="${C.ink}" font-size="36">Recommander System</text>
<text x="768" y="180" fill="${C.green}" font-family="monospace" font-size="18">FIND THE NEXT TRACK</text>
<text x="768" y="930" fill="${C.green}" font-family="monospace" font-size="16">ILLUSTRATIVE SORTING</text>
</g>
<g fill="none" stroke="${C.green}" stroke-opacity=".33" stroke-width="2">${entries}</g>
<g fill="none" stroke="${C.green}" stroke-opacity=".38" stroke-width="2.8">${edges}</g>
<g fill="none" stroke-opacity=".45" stroke-width="2">${exits}</g>${nodes}${outputs}${notes}
</svg>\n`;
await writeFile(
  new URL('../public/media/scene/music-recommendation.svg', import.meta.url),
  svg,
);
console.log(
  'Generated music poster from the animation’s initial particle positions.',
);
