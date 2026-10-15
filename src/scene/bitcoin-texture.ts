import { createPricePath } from './bitcoin-path.ts';

export const PRICE_CANVAS = { width: 1536, height: 960 };
export const PRICE_PLOT = { left: 60, right: 1476, top: 250, bottom: 780 };
export const PRICE_COLORS = {
  background: '#2a1916',
  grid: '#53352a',
  line: '#e4b838',
  accent: '#f6d370',
  text: '#f0dfc5',
  muted: '#b58c72',
};

export function priceBounds(samples: { price: number }[]) {
  const low = Math.min(...samples.map((p) => p.price));
  const high = Math.max(...samples.map((p) => p.price));
  return { center: (low + high) / 2, span: Math.max(5, (high - low) * 1.5) };
}

export function priceCoordinates(
  samples: { price: number }[],
  center: number,
  span: number,
) {
  return samples.map((p, i) => ({
    x:
      PRICE_PLOT.left +
      (i / (samples.length - 1)) * (PRICE_PLOT.right - PRICE_PLOT.left),
    y:
      (PRICE_PLOT.top + PRICE_PLOT.bottom) / 2 -
      ((p.price - center) / span) * (PRICE_PLOT.bottom - PRICE_PLOT.top),
  }));
}

export function createBitcoinTextureCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = PRICE_CANVAS.width;
  canvas.height = PRICE_CANVAS.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return undefined;
  const path = createPricePath();
  const initial = path.snapshot();
  let { center, span } = priceBounds(initial.samples);
  let elapsed = 0;
  let frames = 0;
  let lastTick: number | undefined;
  let nextTick = 0;
  let running = false;

  function draw() {
    const ctx = context!;
    const state = path.snapshot();
    const points = priceCoordinates(state.samples, center, span);
    ctx.fillStyle = PRICE_COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = PRICE_COLORS.grid;
    ctx.lineWidth = 1;
    for (let y = PRICE_PLOT.top; y <= PRICE_PLOT.bottom; y += 106) {
      ctx.beginPath();
      ctx.moveTo(PRICE_PLOT.left, y);
      ctx.lineTo(PRICE_PLOT.right, y);
      ctx.stroke();
    }
    for (let x = PRICE_PLOT.left; x <= PRICE_PLOT.right; x += 236) {
      ctx.beginPath();
      ctx.moveTo(x, PRICE_PLOT.top);
      ctx.lineTo(x, PRICE_PLOT.bottom);
      ctx.stroke();
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = PRICE_COLORS.muted;
    ctx.font = '40px sans-serif';
    ctx.fillText('B T C', canvas.width / 2, 100);
    ctx.fillStyle = PRICE_COLORS.text;
    ctx.font = '54px monospace';
    ctx.fillText(
      `$${Math.round(state.price * 640).toLocaleString('en-US')}`,
      canvas.width / 2,
      175,
    );
    ctx.fillStyle = PRICE_COLORS.muted;
    ctx.font = '18px sans-serif';
    ctx.fillText('SIMULATED PRICE PATH', canvas.width / 2, 865);
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      PRICE_PLOT.left,
      PRICE_PLOT.top,
      PRICE_PLOT.right - PRICE_PLOT.left,
      PRICE_PLOT.bottom - PRICE_PLOT.top,
    );
    ctx.clip();
    const line = new Path2D();
    points.forEach((point, i) =>
      i ? line.lineTo(point.x, point.y) : line.moveTo(point.x, point.y),
    );
    const fill = new Path2D(line);
    fill.lineTo(PRICE_PLOT.right, PRICE_PLOT.bottom);
    fill.lineTo(PRICE_PLOT.left, PRICE_PLOT.bottom);
    fill.closePath();
    const gradient = ctx.createLinearGradient(
      0,
      PRICE_PLOT.top,
      0,
      PRICE_PLOT.bottom,
    );
    gradient.addColorStop(0, `${PRICE_COLORS.line}28`);
    gradient.addColorStop(1, `${PRICE_COLORS.line}00`);
    ctx.fillStyle = gradient;
    ctx.fill(fill);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = `${PRICE_COLORS.line}14`;
    ctx.lineWidth = 16;
    ctx.stroke(line);
    ctx.strokeStyle = PRICE_COLORS.line;
    ctx.lineWidth = 3.5;
    ctx.stroke(line);
    const tip = points.at(-1)!;
    ctx.strokeStyle = PRICE_COLORS.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    points
      .slice(-41)
      .forEach((point, i) =>
        i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
      );
    ctx.stroke();
    ctx.fillStyle = PRICE_COLORS.accent;
    ctx.beginPath();
    ctx.arc(tip.x - 3, tip.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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
      // Target 60 fps even on high-refresh displays; never catch up paused time.
      if (now + 0.5 < nextTick) return false;
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;
      nextTick +=
        (1000 / 60) *
        Math.max(1, Math.floor((now - nextTick) / (1000 / 60)) + 1);
      path.advance(dt);
      elapsed += dt;
      frames++;
      const target = priceBounds(path.snapshot().samples);
      const weight = 1 - Math.exp(-dt * 1.4);
      center += (target.center - center) * weight;
      span += (target.span - span) * weight;
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
