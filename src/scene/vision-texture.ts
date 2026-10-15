import {
  VISION_STATES,
  VISION_TILES,
  VISION_TILE_SIZE,
  visionTileFrame,
} from './vision-mosaic.ts';

export function createVisionTextureCanvas() {
  const canvas = document.createElement('canvas');
  const base = document.createElement('canvas');
  canvas.width = base.width = 1536;
  canvas.height = base.height = 960;
  const context = canvas.getContext('2d', { alpha: false });
  const background = base.getContext('2d', { alpha: false });
  if (!context || !background) return undefined;
  const scale = canvas.width / 960;
  background.scale(scale, scale);
  const gradient = background.createLinearGradient(240, 0, 700, 600);
  gradient.addColorStop(0, '#202f2c');
  gradient.addColorStop(1, '#0b1413');
  background.fillStyle = gradient;
  background.fillRect(0, 0, 960, 600);
  background.textAlign = 'center';
  background.fillStyle = '#9fb7ab';
  background.font = '14px monospace';
  background.fillText('SATELLITE IMAGE ANALYSIS', 480, 55);
  background.fillStyle = '#e3e9de';
  background.font = '38px Georgia, serif';
  background.fillText('Visual Learning', 480, 101);
  background.strokeStyle = '#a5b4a426';
  background.lineWidth = 1;
  background.stroke(
    new Path2D('M250 158V126h32M678 126h32v32M250 554v32h32M678 586h32v-32'),
  );

  let images: HTMLImageElement[] = [];
  let assetsReady = false;
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
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    for (const [index, tile] of VISION_TILES.entries()) {
      const frame = visionTileFrame(elapsed, index);
      const state = VISION_STATES[frame.label]!;
      // Both representations use exactly the same source crop. No spatial morph.
      ctx.globalAlpha = 1;
      ctx.drawImage(
        images[frame.from]!,
        tile.sx,
        tile.sy,
        185,
        185,
        tile.x,
        tile.y,
        VISION_TILE_SIZE,
        VISION_TILE_SIZE,
      );
      if (frame.blend > 0) {
        ctx.globalAlpha = frame.blend;
        ctx.drawImage(
          images[frame.to]!,
          tile.sx,
          tile.sy,
          185,
          185,
          tile.x,
          tile.y,
          VISION_TILE_SIZE,
          VISION_TILE_SIZE,
        );
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0a1514e8';
      ctx.fillRect(tile.x, tile.y + 174, VISION_TILE_SIZE, 34);
      ctx.fillStyle = state.color;
      ctx.beginPath();
      ctx.arc(tile.x + 15, tile.y + 191, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.font = '15px system-ui, sans-serif';
      ctx.fillText(state.label, tile.x + 28, tile.y + 196);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9baca2';
      ctx.font = '10px monospace';
      ctx.fillText(state.detail, tile.x + 194, tile.y + 196);
      ctx.strokeStyle = '#c2d4c82e';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(tile.x, tile.y, VISION_TILE_SIZE, VISION_TILE_SIZE);
    }
  }

  const ready = Promise.all(
    VISION_STATES.map(
      ({ src }) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            image.onload = image.onerror = null;
            resolve(image);
          };
          image.onerror = () => {
            image.onload = image.onerror = null;
            reject(new Error(`Could not load ${src}`));
          };
          image.src = src;
        }),
    ),
  )
    .then((loaded) => {
      if (disposed) return false;
      images = loaded;
      assetsReady = true;
      draw();
      return true;
    })
    .catch(() => false);

  return {
    canvas,
    ready,
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
      running = enabled && assetsReady && !disposed;
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
      images = [];
      canvas.width = canvas.height = base.width = base.height = 1;
    },
  };
}
