import { readFile, writeFile } from 'node:fs/promises';
import { format, resolveConfig } from 'prettier';

// Reuse the existing artwork exactly: no node or edge is added or moved.
const svg = await readFile(
  new URL('../public/media/scene/link-prediction.svg', import.meta.url),
  'utf8',
);
const nodes = [];
const indices = new Map();
const node = (x, y) => {
  const key = `${x},${y}`;
  if (!indices.has(key)) {
    indices.set(key, nodes.length);
    nodes.push({ x, y });
  }
  return indices.get(key);
};
const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
  );
const circles = [...svg.matchAll(/<circle\s[^>]+\/>/g)].map((m) => {
  const a = attributes(m[0]);
  return {
    node: node(+a.cx, +a.cy),
    radius: +a.r,
    color: a.fill,
    opacity: +a.opacity,
  };
});
const edges = [...svg.matchAll(/<path\s[^>]+\/>/g)].flatMap((m) => {
  const a = attributes(m[0]);
  const p = /^M([\d.]+),([\d.]+) L([\d.]+),([\d.]+)$/.exec(a.d);
  if (!p) return [];
  return [
    {
      a: node(+p[1], +p[2]),
      b: node(+p[3], +p[4]),
      color: a.stroke,
      width: +a['stroke-width'],
      opacity: +a.opacity,
      dashed: !!a['stroke-dasharray'],
    },
  ];
});
const output = `// Generated from the unchanged public/media/scene/link-prediction.svg.\n// Regenerate with node scripts/generate-link-network.mjs.\nexport const LINK_NODES = ${JSON.stringify(nodes)};\nexport const LINK_EDGES = ${JSON.stringify(edges)};\nexport const LINK_CIRCLES = ${JSON.stringify(circles)};\n`;
await writeFile(
  new URL('../src/scene/link-network.ts', import.meta.url),
  await format(output, {
    ...(await resolveConfig('src/scene/link-network.ts')),
    parser: 'typescript',
  }),
);
console.log(
  `Extracted ${nodes.length} original nodes and ${edges.length} original edges.`,
);
