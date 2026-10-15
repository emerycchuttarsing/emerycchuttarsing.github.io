import {
  EMBEDDING_CANVAS,
  EMBEDDING_COLORS as C,
  embeddingFrame,
} from './embedding-space.ts';

export function createEmbeddingTextureCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = EMBEDDING_CANVAS.width;
  canvas.height = EMBEDDING_CANVAS.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return undefined;
  let elapsed = 0;
  let frames = 0;
  let lastTick: number | undefined;
  let nextTick = 0;
  let running = false;
  let disposed = false;
  const background = context.createLinearGradient(0, 0, 0, 960);
  background.addColorStop(0, C.background);
  background.addColorStop(1, C.bottom);

  function draw() {
    const ctx = context!;
    const frame = embeddingFrame(elapsed);
    ctx.globalAlpha = 1;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1536, 960);
    ctx.textAlign = 'center';
    ctx.fillStyle = C.muted;
    ctx.font = '18px monospace';
    ctx.fillText('LANGUAGE, IN SPACE', 768, 81);
    ctx.fillStyle = C.text;
    ctx.font = '56px Georgia, serif';
    ctx.fillText('TinyStories', 768, 146);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = C.muted;
    ctx.fillText('An embedding neighbourhood', 768, 186);

    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    for (const { a, b } of frame.lines) {
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    for (const { a, b, main } of frame.links) {
      ctx.strokeStyle = a.color;
      ctx.globalAlpha = main ? 0.52 : 0.25;
      ctx.lineWidth = main ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (const node of frame.nodes) {
      ctx.globalAlpha = node.alpha * 0.1;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(
        node.x,
        node.y,
        (node.main ? 18 : 12) * node.scale,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = node.alpha;
      ctx.beginPath();
      ctx.arc(node.x, node.y, (node.main ? 4 : 3) * node.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${node.main ? 500 : 400} ${node.fontSize}px sans-serif`;
      // Billboard text stays facing the viewer as the camera orbits the points.
      ctx.strokeStyle = C.bottom;
      ctx.lineJoin = 'round';
      ctx.lineWidth = 7;
      ctx.strokeText(node.word, node.x, node.y - 17);
      ctx.fillText(node.word, node.x, node.y - 17);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.muted;
    ctx.font = '16px monospace';
    ctx.fillText('ILLUSTRATIVE EMBEDDING SPACE', 768, 916);
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
      canvas.width = canvas.height = 1;
    },
  };
}
