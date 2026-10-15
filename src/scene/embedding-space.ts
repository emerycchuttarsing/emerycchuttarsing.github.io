export const EMBEDDING_CANVAS = { width: 1536, height: 960 };
export const EMBEDDING_DURATION = 32;
export const EMBEDDING_COLORS = {
  background: '#17171f',
  bottom: '#25202e',
  text: '#e1dce9',
  muted: '#968ba7',
  grid: '#70657f',
  pets: '#c9b6e2',
  people: '#cbbfae',
  nature: '#9eaea5',
};
export type EmbeddingPosition = readonly [number, number, number];

// Hand-placed semantic relationships, not coordinates from trained weights.
// Words are drawn from the homework's prompts, continuations and neighbours.
export const EMBEDDING_WORDS = [
  { word: 'dog', position: [-1.05, 0.72, -0.4], group: 'pets', main: true },
  { word: 'cat', position: [-0.2, 1.04, 0.05], group: 'pets', main: true },
  { word: 'whiskers', position: [0.65, 1.4, 0.18], group: 'pets', main: true },
  { word: 'puppy', position: [-1.15, 0.08, 0.2], group: 'pets' },
  { word: 'bunny', position: [-0.42, -0.48, 0.75], group: 'pets' },
  { word: 'boy', position: [1.08, 0.4, -0.72], group: 'people' },
  { word: 'girl', position: [0.98, -0.28, -0.75], group: 'people' },
  { word: 'forest', position: [-0.7, -1.35, -0.3], group: 'nature' },
  { word: 'bird', position: [-0.7, -0.86, 0.55], group: 'nature' },
  { word: 'sunflower', position: [0.65, -1.18, 0.6], group: 'nature' },
] as const;
export const EMBEDDING_LINKS = [
  ['dog', 'cat'],
  ['cat', 'whiskers'],
  ['dog', 'puppy'],
  ['boy', 'girl'],
  ['forest', 'bird'],
  ['forest', 'sunflower'],
] as const;

export function projectEmbeddingPoint(
  [x, y, z]: EmbeddingPosition,
  elapsed: number,
) {
  const yaw =
    -0.45 + ((elapsed % EMBEDDING_DURATION) / EMBEDDING_DURATION) * Math.PI * 2;
  const pitch = 0.22;
  const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
  const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
  const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
  const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
  const scale = 5.5 / (5.5 - depth);
  return { x: 768 + rx * 165 * scale, y: 535 - ry * 165 * scale, depth, scale };
}

const grid: [EmbeddingPosition, EmbeddingPosition][] = [];
const half = 1.6;
for (let step = -4; step <= 4; step++) {
  const p = (step * half) / 4;
  grid.push([
    [p, -half, -half],
    [p, -half, half],
  ]);
  grid.push([
    [-half, -half, p],
    [half, -half, p],
  ]);
}
// A restrained wireframe gives the rotating camera a stable spatial reference.
for (const x of [-half, half]) {
  for (const z of [-half, half])
    grid.push([
      [x, -half, z],
      [x, half, z],
    ]);
  grid.push([
    [x, half, -half],
    [x, half, half],
  ]);
  grid.push([
    [-half, half, x],
    [half, half, x],
  ]);
}

export function embeddingFrame(elapsed: number) {
  const nodes = EMBEDDING_WORDS.map((word) => {
    const projected = projectEmbeddingPoint(word.position, elapsed);
    const main = 'main' in word && word.main;
    return {
      ...projected,
      word: word.word,
      color: EMBEDDING_COLORS[word.group],
      main,
      alpha: Math.min(1, 0.72 + projected.depth * 0.16),
      fontSize:
        (main ? 42 : 32) * Math.min(1.16, Math.max(0.86, projected.scale)),
    };
  }).sort((a, b) => a.depth - b.depth);
  const byWord = new Map(nodes.map((node) => [node.word, node]));
  const lines = grid.map(([a, b]) => ({
    a: projectEmbeddingPoint(a, elapsed),
    b: projectEmbeddingPoint(b, elapsed),
  }));
  const links = EMBEDDING_LINKS.map(([a, b]) => ({
    a: byWord.get(a)!,
    b: byWord.get(b)!,
    main: a === 'cat' || b === 'cat',
  }));
  return { nodes, lines, links };
}
