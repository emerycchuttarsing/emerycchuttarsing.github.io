import { createHedgeFrame, HEDGE_WINDOW } from './hedging-path.ts';

export const HEDGE_CANVAS = { width: 1536, height: 960 };
export const HEDGE_PLOT = {
  left: 60,
  right: 1476,
  priceTop: 280,
  priceBottom: 552,
  positionTop: 638,
  positionBottom: 820,
};
export const HEDGE_COLORS = {
  background: '#171e1c',
  grid: '#303e37',
  price: '#a6b2ad',
  hedge: '#6aaa82',
  accent: '#add6bb',
  text: '#dee5df',
  muted: '#82978b',
};

export function hedgeCoordinates(state: ReturnType<typeof createHedgeFrame>) {
  const P = HEDGE_PLOT;
  const prices = state.samples.map((sample) => sample.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const center = (low + high) / 2;
  const span = Math.max(4, (high - low) * 1.3);
  const x = (time: number) =>
    P.left + ((time - state.start) / HEDGE_WINDOW) * (P.right - P.left);
  const priceY = (price: number) =>
    (P.priceTop + P.priceBottom) / 2 -
    ((price - center) / span) * (P.priceBottom - P.priceTop);
  const positionY = (position: number) =>
    P.positionBottom - position * (P.positionBottom - P.positionTop);
  return {
    price: state.samples.map((point) => ({
      x: x(point.time),
      y: priceY(point.price),
    })),
    position: state.holdings.map((point) => ({
      x: x(point.time),
      y: positionY(point.position),
    })),
    events: state.events.map((event) => ({
      x: x(event.time),
      priceY: priceY(event.price),
      positionY: positionY(event.position),
    })),
  };
}

export function createHedgeTextureCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = HEDGE_CANVAS.width;
  canvas.height = HEDGE_CANVAS.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return undefined;
  let elapsed = 0;
  let frames = 0;
  let lastTick: number | undefined;
  let nextTick = 0;
  let running = false;

  function draw() {
    const ctx = context!;
    const C = HEDGE_COLORS;
    const P = HEDGE_PLOT;
    const state = createHedgeFrame(elapsed);
    const points = hedgeCoordinates(state);
    ctx.fillStyle = C.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    for (const [top, bottom] of [
      [P.priceTop, P.priceBottom],
      [P.positionTop, P.positionBottom],
    ] as const) {
      for (let i = 0; i <= 2; i++) {
        const y = top + (i / 2) * (bottom - top);
        ctx.beginPath();
        ctx.moveTo(P.left, y);
        ctx.lineTo(P.right, y);
        ctx.stroke();
      }
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = C.text;
    ctx.font = '40px sans-serif';
    ctx.fillText('DEEP HEDGING', canvas.width / 2, 92);
    ctx.fillStyle = C.accent;
    ctx.font = '60px monospace';
    ctx.fillText(`${Math.round(state.position * 100)}%`, canvas.width / 2, 170);
    ctx.fillStyle = C.muted;
    ctx.font = '18px sans-serif';
    ctx.fillText('HEDGE POSITION', canvas.width / 2, 207);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = C.price;
    ctx.fillText(
      `UNDERLYING · $${state.price.toFixed(2)}`,
      canvas.width / 2,
      257,
    );
    ctx.fillStyle = C.hedge;
    ctx.fillText('REBALANCE & HOLD', canvas.width / 2, 610);
    ctx.fillStyle = C.muted;
    ctx.font = '18px sans-serif';
    ctx.fillText('ILLUSTRATIVE HEDGE', canvas.width / 2, 887);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    function line(points: { x: number; y: number }[]) {
      const path = new Path2D();
      points.forEach((point, i) =>
        i ? path.lineTo(point.x, point.y) : path.moveTo(point.x, point.y),
      );
      return path;
    }
    function dot(x: number, y: number, radius: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    const priceLine = line(points.price);
    const positionLine = line(points.position);
    const area = new Path2D(positionLine);
    area.lineTo(P.right, P.positionBottom);
    area.lineTo(P.left, P.positionBottom);
    area.closePath();
    const gradient = ctx.createLinearGradient(
      0,
      P.positionTop,
      0,
      P.positionBottom,
    );
    gradient.addColorStop(0, `${C.hedge}30`);
    gradient.addColorStop(1, `${C.hedge}03`);
    ctx.fillStyle = gradient;
    ctx.fill(area);

    // Connect each observed price to its corresponding hedge adjustment.
    ctx.strokeStyle = `${C.hedge}32`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 8]);
    for (const event of points.events) {
      ctx.beginPath();
      ctx.moveTo(event.x, event.priceY);
      ctx.lineTo(event.x, event.positionY);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = C.price;
    ctx.lineWidth = 3;
    ctx.stroke(priceLine);
    ctx.strokeStyle = `${C.hedge}12`;
    ctx.lineWidth = 15;
    ctx.stroke(positionLine);
    ctx.strokeStyle = C.hedge;
    ctx.lineWidth = 4;
    ctx.stroke(positionLine);
    for (const event of points.events) {
      dot(event.x, event.priceY, 3.5, C.hedge);
      dot(event.x, event.positionY, 5, C.accent);
    }
    const latest = points.events.at(-1);
    if (latest && state.sinceRebalance < 0.8) {
      const pulse = state.sinceRebalance / 0.8;
      ctx.globalAlpha = (1 - pulse) * 0.45;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(latest.x, latest.positionY, 6 + pulse * 21, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const tip = points.price.at(-1)!;
    dot(tip.x - 3, tip.y, 4.5, C.text);
  }
  draw();
  return {
    canvas,
    get elapsed() {
      return elapsed;
    },
    get frames() {
      return frames;
    },
    get running() {
      return running;
    },
    tick(now: number, enabled: boolean) {
      running = enabled;
      if (!enabled) {
        lastTick = undefined;
        return false;
      }
      if (lastTick === undefined) {
        lastTick = now;
        nextTick = now + 1000 / 60;
        return false;
      }
      if (now + 0.5 < nextTick) return false;
      elapsed += Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;
      nextTick +=
        (1000 / 60) *
        Math.max(1, Math.floor((now - nextTick) / (1000 / 60)) + 1);
      frames++;
      draw();
      return true;
    },
    stop() {
      running = false;
      lastTick = undefined;
    },
    dispose() {
      running = false;
      lastTick = undefined;
      canvas.width = canvas.height = 1;
    },
  };
}
