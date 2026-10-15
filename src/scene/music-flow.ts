export const MUSIC_CANVAS = { width: 1536, height: 960 };
export const MUSIC_COLORS = {
  background: '#bdcbb9',
  backgroundBottom: '#aabca8',
  ink: '#17221c',
  rejected: '#7b827b',
  green: '#456a50',
  edge: '#68866b',
  node: '#d8e1cf',
};

// Keep the whole story inside the gallery's centered portrait crop.
export const MUSIC_LAYERS = [
  [480, 624, 768, 912, 1056].map((x) => ({ x, y: 300 })),
  [552, 696, 840, 984].map((x) => ({ x, y: 480 })),
  [624, 768, 912].map((x) => ({ x, y: 660 })),
];
export const MUSIC_OUTPUTS = [
  { x: 580, y: 810 },
  { x: 970, y: 810 },
];
export const MUSIC_NOTE =
  'M4 -26H9V10C9 19 -7 25 -12 17C-17 9 -3 0 4 4Z M8 -26C10 -16 25 -16 20 -3C19 -12 11 -10 8 -15Z';
export const MUSIC_DOUBLE_NOTE =
  'M-12 -22L17 -28V8C17 17 3 22 -1 15C-5 8 7 1 12 4V-17L-7 -13V16C-7 25 -21 30 -25 23C-29 16 -17 9 -12 12Z';
export const MUSIC_DURATION = 12;
export const MUSIC_PARTICLES = 16;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const random = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export function musicFrame(elapsed: number) {
  return Array.from({ length: MUSIC_PARTICLES }, (_, id) => {
    const phase =
      ((((elapsed + (id / MUSIC_PARTICLES) * MUSIC_DURATION) % MUSIC_DURATION) +
        MUSIC_DURATION) %
        MUSIC_DURATION) /
      MUSIC_DURATION;
    const selected = random(id + 20) > 0.52;
    const route = MUSIC_LAYERS.map((layer, i) =>
      Math.floor(random(id * 7 + i + 40) * layer.length),
    );
    const first = MUSIC_LAYERS[0]![route[0]!]!;
    const second = MUSIC_LAYERS[1]![route[1]!]!;
    const third = MUSIC_LAYERS[2]![route[2]!]!;
    const source = { x: first.x, y: 215 };
    const destination = MUSIC_OUTPUTS[selected ? 0 : 1]!;
    const times = [0, 0.15, 0.4, 0.65, 0.88, 1];
    const points = [source, first, second, third, destination, destination];
    let segment = 0;
    while (segment < 4 && phase > times[segment + 1]!) segment++;
    const t =
      (phase - times[segment]!) / (times[segment + 1]! - times[segment]!);
    const a = points[segment]!;
    const b = points[segment + 1]!;
    const travel = segment === 3 ? ease(t) : t;
    const alpha = Math.min(1, phase / 0.045, (1 - phase) / 0.08);
    return {
      id,
      phase,
      selected,
      route,
      x: mix(a.x, b.x, travel),
      y: mix(a.y, b.y, travel),
      alpha: alpha * (selected ? 1 : 0.72),
      scale: 0.88,
      rotation: 0,
      double: id % 4 === 0,
    };
  });
}

export type MusicFrame = ReturnType<typeof musicFrame>;

export function musicNodeActivity(
  frame: MusicFrame,
  layer: number,
  node: number,
) {
  const crossing = [0.15, 0.4, 0.65][layer]!;
  return Math.max(
    0,
    ...frame
      .filter((note) => note.route[layer] === node)
      .map((note) => 1 - Math.abs(note.phase - crossing) / 0.045),
  );
}
