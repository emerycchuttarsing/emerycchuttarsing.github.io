import {
  retailBackdrop,
  retailFrame,
  type RetailShape,
} from './retail-artwork.ts';

function drawShapes(ctx: CanvasRenderingContext2D, shapes: RetailShape[]) {
  for (const s of shapes) {
    ctx.globalAlpha = s.opacity ?? 1;
    ctx.fillStyle = s.fill ?? 'transparent';
    ctx.strokeStyle = s.stroke ?? 'transparent';
    ctx.lineWidth = s.width ?? 1;
    ctx.setLineDash(s.dash ?? []);
    if (s.kind === 'text') {
      ctx.font = `${s.size}px ${s.font ?? 'system-ui, sans-serif'}`;
      ctx.textAlign = s.align ?? 'center';
      ctx.fillText(s.text, s.x, s.y);
      continue;
    }
    const shape = new Path2D(s.kind === 'path' ? s.d : undefined);
    if (s.kind === 'rect') shape.roundRect(s.x, s.y, s.w, s.h, s.r ?? 0);
    if (s.kind === 'circle') shape.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    if (s.fill) ctx.fill(shape);
    if (s.stroke) ctx.stroke(shape);
  }
  ctx.globalAlpha = 1;
}

export function createRetailTextureCanvas() {
  const canvas = document.createElement('canvas');
  const base = document.createElement('canvas');
  canvas.width = base.width = 1536;
  canvas.height = base.height = 960;
  const context = canvas.getContext('2d', { alpha: false });
  const background = base.getContext('2d', { alpha: false });
  if (!context || !background) return undefined;
  const scale = canvas.width / 960;
  background.scale(scale, scale);
  background.lineJoin = background.lineCap = 'round';
  drawShapes(background, retailBackdrop());
  let elapsed = 0,
    frames = 0,
    nextTick = 0;
  let lastTick: number | undefined;
  let running = false,
    disposed = false;

  function draw() {
    const ctx = context!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(base, 0, 0);
    ctx.scale(scale, scale);
    ctx.lineJoin = ctx.lineCap = 'round';
    drawShapes(ctx, retailFrame(elapsed).shapes);
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
      running = enabled && !disposed;
      if (!running) {
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
      disposed = true;
      running = false;
      lastTick = undefined;
      canvas.width = canvas.height = base.width = base.height = 1;
    },
  };
}
