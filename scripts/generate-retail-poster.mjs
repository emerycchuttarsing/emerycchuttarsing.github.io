import { writeFile } from 'node:fs/promises';
import { retailBackdrop, retailFrame } from '../src/scene/retail-artwork.ts';

const escape = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
const svgShape = (s) => {
  const attrs = `fill="${s.fill ?? 'none'}" stroke="${s.stroke ?? 'none'}" stroke-width="${s.width ?? 1}" opacity="${s.opacity ?? 1}"${s.dash ? ` stroke-dasharray="${s.dash.join(' ')}"` : ''}`;
  if (s.kind === 'rect')
    return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.r ?? 0}" ${attrs}/>`;
  if (s.kind === 'circle')
    return `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" ${attrs}/>`;
  if (s.kind === 'path') return `<path d="${s.d}" ${attrs}/>`;
  const anchor =
    s.align === 'left' ? 'start' : s.align === 'right' ? 'end' : 'middle';
  return `<text x="${s.x}" y="${s.y}" font-size="${s.size}" font-family="${escape(s.font ?? 'system-ui, sans-serif')}" text-anchor="${anchor}" ${attrs}>${escape(s.text)}</text>`;
};
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1200" viewBox="0 0 960 600" stroke-linejoin="round" stroke-linecap="round">
<title>AKO · Retail demand forecasting</title>
<desc>Illustrative sales bars become a copper forecast curve connected to three stores. Decorative values, not saved model predictions. AKO is a typographic label, not an official logo.</desc>
${[...retailBackdrop(), ...retailFrame(0).shapes].map(svgShape).join('\n')}
</svg>\n`;
await writeFile(
  new URL('../public/media/scene/retail-forecasting.svg', import.meta.url),
  svg,
);
console.log('Generated the AKO poster from the animation’s initial frame.');
