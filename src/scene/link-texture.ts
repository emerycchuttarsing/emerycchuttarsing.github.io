import { LINK_CIRCLES, LINK_EDGES, LINK_NODES } from './link-network.ts';
import { linkSignalFrame } from './link-signal.ts';

export function createLinkTextureCanvas() {
  const canvas = document.createElement('canvas');
  const base = document.createElement('canvas');
  canvas.width = base.width = 1536;
  canvas.height = base.height = 960;
  const context = canvas.getContext('2d', { alpha: false });
  const background = base.getContext('2d', { alpha: false });
  if (!context || !background) return undefined;
  const scale = canvas.width / 960;

  // Cache the original composition once. Only the signal is drawn each frame.
  background.scale(scale, scale);
  // SVG uses object-bounding-box gradient coordinates on a 960 × 600 rectangle.
  const gradient = background.createLinearGradient(0, 0, 539.3258, 862.9213);
  gradient.addColorStop(0, '#233137');
  gradient.addColorStop(1, '#11181d');
  background.fillStyle = gradient;
  background.fillRect(0, 0, 960, 600);
  background.save();
  background.translate(490, 280);
  background.scale(500, 420);
  const glow = background.createRadialGradient(0, 0, 0, 0, 0, 1);
  glow.addColorStop(0, '#65758040');
  glow.addColorStop(1, '#65758000');
  background.fillStyle = glow;
  background.beginPath();
  background.arc(0, 0, 1, 0, Math.PI * 2);
  background.fill();
  background.restore();
  background.strokeStyle = '#b3c5c2';
  background.globalAlpha = 0.38;
  background.lineWidth = 1;
  background.stroke(
    new Path2D('M36 61V36h25M899 36h25v25M36 539v25h25M899 564h25v-25'),
  );
  background.globalAlpha = 1;
  background.textAlign = 'center';
  background.fillStyle = '#adbfba';
  background.font = '16px monospace';
  background.fillText('OPTIMIZATION FOR', 480, 68);
  background.fillStyle = '#eee9df';
  background.font = '38px Georgia, serif';
  background.fillText('Link Prediction', 480, 114);
  for (const edge of LINK_EDGES) {
    background.strokeStyle = edge.color;
    background.globalAlpha = edge.opacity;
    background.lineWidth = edge.width;
    background.setLineDash(edge.dashed ? [6, 6] : []);
    const a = LINK_NODES[edge.a]!;
    const b = LINK_NODES[edge.b]!;
    background.beginPath();
    background.moveTo(a.x, a.y);
    background.lineTo(b.x, b.y);
    background.stroke();
  }
  background.setLineDash([]);
  for (const circle of LINK_CIRCLES) {
    const point = LINK_NODES[circle.node]!;
    background.fillStyle = circle.color;
    background.globalAlpha = circle.opacity;
    background.beginPath();
    background.arc(point.x, point.y, circle.radius, 0, Math.PI * 2);
    background.fill();
  }
  let elapsed = 0;
  let frames = 0;
  let lastTick: number | undefined;
  let nextTick = 0;
  let running = false;
  let disposed = false;

  function draw() {
    const ctx = context!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(base, 0, 0);
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    const frame = linkSignalFrame(elapsed);
    for (const state of frame.edges) {
      const edge = LINK_EDGES[state.edge]!;
      const a = LINK_NODES[edge.a]!;
      const b = LINK_NODES[edge.b]!;
      ctx.strokeStyle = `rgb(${state.color.join(',')})`;
      ctx.setLineDash(edge.dashed ? [6, 6] : []);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = 8;
      ctx.globalAlpha = state.alpha * 0.1;
      ctx.stroke();
      ctx.lineWidth = 2.3;
      ctx.globalAlpha = state.alpha;
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const pulse = frame.pulse;
    ctx.fillStyle = '#ef9039';
    ctx.globalAlpha = pulse.alpha * 0.13;
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = pulse.alpha * 0.35;
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6bb77';
    ctx.globalAlpha = pulse.alpha;
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, 2.7, 0, Math.PI * 2);
    ctx.fill();
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
