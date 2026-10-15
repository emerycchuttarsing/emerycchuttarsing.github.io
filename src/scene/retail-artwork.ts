// Original illustrative artwork: these values are not the saved AKO forecasts.
export const RETAIL_CYCLE = 24;
export const RETAIL_COLORS = {
  background: '#121d24',
  panel: '#18252d',
  grid: '#293840',
  text: '#e9e0cc',
  muted: '#8b9a9e',
  history: '#91b4ab',
  forecast: '#dcaa79',
  copper: '#875c43',
};

type Paint = {
  fill?: string;
  stroke?: string;
  width?: number;
  opacity?: number;
  dash?: number[];
};
export type RetailShape = Paint &
  (
    | { kind: 'rect'; x: number; y: number; w: number; h: number; r?: number }
    | { kind: 'path'; d: string }
    | { kind: 'circle'; x: number; y: number; r: number }
    | {
        kind: 'text';
        x: number;
        y: number;
        text: string;
        size: number;
        font?: string;
        align?: 'left' | 'center' | 'right';
      }
  );

const C = RETAIL_COLORS;
const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  opacity = 1,
  r = 0,
): RetailShape => ({ kind: 'rect', x, y, w, h, fill, opacity, r });
const path = (
  d: string,
  stroke: string,
  width = 1,
  opacity = 1,
  dash?: number[],
): RetailShape => ({
  kind: 'path',
  d,
  stroke,
  width,
  opacity,
  ...(dash ? { dash } : {}),
});
const text = (
  x: number,
  y: number,
  label: string,
  size: number,
  fill = C.muted,
  font = 'system-ui, sans-serif',
  align: 'left' | 'center' | 'right' = 'center',
): RetailShape => ({
  kind: 'text',
  x,
  y,
  text: label,
  size,
  fill,
  font,
  align,
});
const circle = (
  x: number,
  y: number,
  r: number,
  fill: string,
  opacity = 1,
): RetailShape => ({ kind: 'circle', x, y, r, fill, opacity });
const smooth = (t: number) => {
  const v = Math.max(0, Math.min(1, t));
  return v * v * (3 - 2 * v);
};
const fmt = (n: number) => n.toFixed(2);

export const RETAIL_STORES = [
  { x: 326, label: 'NEW YORK' },
  { x: 480, label: 'PHOENIX' },
  { x: 634, label: 'SEATTLE' },
];

export function retailBackdrop(): RetailShape[] {
  const shapes: RetailShape[] = [
    rect(0, 0, 960, 600, C.background),
    // Quiet architectural lines extend into the uncropped preview margins.
    path('M170 600V170L480 0L790 170V600', C.grid, 1, 0.28),
    path('M210 600V192L480 44L750 192V600', C.grid, 1, 0.22),
    text(480, 36, 'STARTUP CASE STUDY', 11, C.muted, 'monospace'),
    text(480, 102, 'AKO', 68, C.text, 'Georgia, serif'),
    text(480, 144, 'Demand forecasting', 29, C.text, 'Georgia, serif'),
    circle(284, 188, 3, C.history),
    text(295, 192, 'Sales history', 12, C.history, undefined, 'left'),
    circle(554, 188, 3, C.forecast),
    text(565, 192, 'Forecast', 12, C.forecast, undefined, 'left'),
    rect(526, 209, 168, 183, C.copper, 0.055),
    path('M520 206V395', C.forecast, 1, 0.36, [3, 6]),
    text(280, 416, 'PAST', 10, C.muted, 'monospace', 'left'),
    text(688, 416, 'NEXT MONTHS', 10, C.forecast, 'monospace', 'right'),
    text(480, 449, 'STORE-LEVEL DEMAND', 10, C.muted, 'monospace'),
  ];
  for (const y of [226, 278, 330, 382])
    shapes.push(path(`M270 ${y}H694`, C.grid, 1, 0.7));
  for (const store of RETAIL_STORES) {
    const x = store.x;
    shapes.push(
      path(`M480 461V472H${x}V485`, C.forecast, 1, 0.25),
      rect(x - 57, 487, 114, 88, C.panel, 1, 7),
      path(
        `M${x - 18} 520V541H${x + 18}V520 M${x - 23} 519L${x - 17} 504H${x + 17}L${x + 23} 519Z`,
        C.history,
        1.3,
        0.82,
      ),
      path(
        `M${x - 8} 506L${x - 11} 519M${x + 8} 506L${x + 11} 519M${x - 3} 541V529H${x + 8}V541`,
        C.history,
        1,
        0.6,
      ),
      rect(x - 33, 551, 66, 4, C.grid, 1, 2),
      text(x, 569, store.label, 9, C.muted, 'monospace'),
    );
  }
  return shapes;
}

export function retailFrame(time: number) {
  const t = ((time % RETAIL_CYCLE) + RETAIL_CYCLE) % RETAIL_CYCLE;
  const phase = (2 * Math.PI * t) / RETAIL_CYCLE;
  const demand = (i: number) =>
    0.48 +
    0.17 * Math.sin(i * 0.49 + phase) +
    0.075 * Math.cos(i * 0.91 - 2 * phase);
  const values = Array.from({ length: 17 }, (_, i) => demand(i));
  const points = values.map((value, i) => ({
    x: i < 11 ? 288 + i * 22 : 540 + (i - 11) * 28,
    y: 382 - value * 210,
  }));
  const line = (start: number, end: number) =>
    points
      .slice(start, end)
      .map((p, i) => `${i ? 'L' : 'M'}${fmt(p.x)} ${fmt(p.y)}`)
      .join(' ');
  const shapes: RetailShape[] = [];
  points.forEach((p, i) => {
    const forecast = i >= 11;
    const width = forecast ? 16 : 13;
    shapes.push(
      rect(
        p.x - width / 2,
        p.y + 10,
        width,
        382 - p.y - 10,
        forecast ? C.forecast : C.history,
        forecast ? 0.23 : 0.28,
        2,
      ),
    );
  });
  shapes.push(
    path(line(0, 11), C.history, 2.2, 0.9),
    path(line(10, 17), C.forecast, 8, 0.06),
    path(line(10, 17), C.forecast, 2.4, 1, [4, 5]),
  );
  points
    .slice(11)
    .forEach((p) => shapes.push(circle(p.x, p.y, 2.4, C.forecast)));

  // A slow signal follows the chart, then branches towards the stores.
  // Its endpoints fade out, so the eight-second loop never visibly jumps.
  const cycle = (t % 8) / 8;
  const travel = Math.min(cycle / 0.76, 1);
  const pointIndex = travel * (points.length - 1);
  const first = points[Math.min(Math.floor(pointIndex), points.length - 2)]!;
  const next = points[Math.min(Math.floor(pointIndex) + 1, points.length - 1)]!;
  const fraction = pointIndex >= points.length - 1 ? 1 : pointIndex % 1;
  const pulse = {
    x: first.x + (next.x - first.x) * fraction,
    y: first.y + (next.y - first.y) * fraction,
    opacity: smooth(cycle / 0.06) * (1 - smooth((cycle - 0.68) / 0.08)),
  };
  const pulseColor = pulse.x < 520 ? C.history : C.forecast;
  shapes.push(
    circle(pulse.x, pulse.y, 11, pulseColor, pulse.opacity * 0.09),
    circle(pulse.x, pulse.y, 4, C.text, pulse.opacity),
  );

  const branch = smooth((cycle - 0.76) / 0.2);
  const branchAlpha =
    smooth((cycle - 0.76) / 0.035) * (1 - smooth((cycle - 0.94) / 0.06));
  const stores = RETAIL_STORES.map((store, i) => {
    const level = (values[11 + i * 2]! + values[12 + i * 2]!) / 2;
    shapes.push(rect(store.x - 33, 551, 66 * level, 4, C.forecast, 0.9, 2));
    // The marker follows the drawn right-angle connector, including its corners.
    const length = 11 + Math.abs(store.x - 480) + 13;
    const distance = branch * length;
    const horizontal = Math.abs(store.x - 480);
    const x =
      distance <= 11
        ? 480
        : distance <= 11 + horizontal
          ? 480 + Math.sign(store.x - 480) * (distance - 11)
          : store.x;
    const y =
      distance <= 11
        ? 461 + distance
        : distance <= 11 + horizontal
          ? 472
          : 472 + distance - 11 - horizontal;
    shapes.push(circle(x, y, 2.5, C.forecast, branchAlpha));
    return level;
  });
  return { shapes, values, stores, pulse };
}
