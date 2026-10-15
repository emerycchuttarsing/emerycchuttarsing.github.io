import { LINK_EDGES, LINK_NODES } from './link-network.ts';

export const LINK_ACTIVE_COLOR = [239, 144, 57] as const;
export const LINK_VISITED_COLOR = [201, 69, 61] as const;
export const LINK_TRAIL_SECONDS = 4.8;
const smooth = (t: number) => {
  const u = Math.max(0, Math.min(1, t));
  return u * u * (3 - 2 * u);
};

// A closed walk on existing connections, including the dashed bridge.
// The decorative signal does not represent learned predictions.
const coordinates = [
  [337.95, 234.07],
  [372.25, 316.61],
  [288.73, 350.22],
  [257.14, 398.99],
  [545.01, 247.67],
  [552.75, 180.32],
  [611.22, 249.47],
  [631.58, 251.54],
  [665.66, 285.44],
  [572.71, 285.34],
  [545.01, 247.67],
  [257.14, 398.99],
  [288.73, 350.22],
  [288.44, 364.53],
  [274.18, 261.99],
  [312.79, 235.85],
  [335.71, 271.59],
  [372.25, 316.61],
  [337.95, 234.07],
];
const route = coordinates.map(([x, y]) => {
  const index = LINK_NODES.findIndex((n) => n.x === x && n.y === y);
  if (index < 0) throw new Error('Signal waypoint is missing from the artwork');
  return index;
});
let duration = 0;
export const LINK_ROUTE = route.slice(0, -1).map((a, i) => {
  const b = route[i + 1]!;
  const edge = LINK_EDGES.findIndex(
    (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
  );
  if (edge < 0) throw new Error('Signal must follow an existing edge');
  const from = LINK_NODES[a]!;
  const to = LINK_NODES[b]!;
  const seconds = Math.max(0.65, Math.hypot(to.x - from.x, to.y - from.y) / 96);
  const segment = { edge, from, to, start: duration, duration: seconds };
  duration += seconds;
  return segment;
});
export const LINK_CYCLE_SECONDS = duration;

export function linkSignalFrame(elapsed: number) {
  const time = Math.max(0, elapsed);
  const local = time % LINK_CYCLE_SECONDS;
  const active =
    LINK_ROUTE.find((segment) => local < segment.start + segment.duration) ??
    LINK_ROUTE[0]!;
  const progress = smooth((local - active.start) / active.duration);
  const recent: {
    edge: number;
    alpha: number;
    color: number[];
    started: number;
    active: boolean;
  }[] = [];
  for (const segment of LINK_ROUTE) {
    const cycle = Math.floor((time - segment.start) / LINK_CYCLE_SECONDS);
    if (cycle < 0) continue;
    const started = segment.start + cycle * LINK_CYCLE_SECONDS;
    const age = time - started;
    const sinceExit = age - segment.duration;
    if (sinceExit >= LINK_TRAIL_SECONDS) continue;
    const isActive = sinceExit < 0;
    const redness = isActive ? 0 : smooth(sinceExit / 0.55);
    const alpha = isActive
      ? 0.9 * smooth(age / 0.18)
      : 0.9 * (1 - smooth((sinceExit - 1.5) / (LINK_TRAIL_SECONDS - 1.5)));
    // Layer older traces under new visits so revisiting a red edge never flashes.
    recent.push({
      edge: segment.edge,
      started,
      active: isActive,
      alpha,
      color: LINK_ACTIVE_COLOR.map(
        (v, i) => v + (LINK_VISITED_COLOR[i]! - v) * redness,
      ),
    });
  }
  return {
    edges: recent.sort((a, b) => a.started - b.started),
    pulse: {
      x: active.from.x + (active.to.x - active.from.x) * progress,
      y: active.from.y + (active.to.y - active.from.y) * progress,
      alpha: smooth(time / 0.25),
      edge: active.edge,
    },
  };
}
