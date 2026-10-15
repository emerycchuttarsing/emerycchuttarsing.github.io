import {
  MUSIC_CANVAS,
  MUSIC_COLORS as C,
  MUSIC_DOUBLE_NOTE,
  MUSIC_LAYERS,
  MUSIC_NOTE,
  MUSIC_OUTPUTS,
  musicFrame,
  musicNodeActivity,
} from './music-flow.ts';
import { SPOTIFY_ICON_PATH } from './spotify-icon.ts';

export function createMusicTextureCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = MUSIC_CANVAS.width;
  canvas.height = MUSIC_CANVAS.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return undefined;
  const single = new Path2D(MUSIC_NOTE);
  const double = new Path2D(MUSIC_DOUBLE_NOTE);
  const spotifyIcon = new Path2D(SPOTIFY_ICON_PATH);
  let elapsed = 0;
  let frames = 0;
  let lastTick: number | undefined;
  let nextTick = 0;
  let running = false;

  function draw() {
    const ctx = context!;
    const frame = musicFrame(elapsed);
    const background = ctx.createLinearGradient(0, 0, 0, 960);
    background.addColorStop(0, C.background);
    background.addColorStop(1, C.backgroundBottom);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1536, 960);

    // The surrounding fine rules give the composition the rhythm of a score.
    ctx.strokeStyle = `${C.edge}20`;
    ctx.lineWidth = 1;
    for (let y = 210; y <= 850; y += 40) {
      ctx.beginPath();
      ctx.moveTo(340, y);
      ctx.lineTo(1196, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#101a15';
    ctx.beginPath();
    ctx.roundRect(626, 46, 58, 58, 8);
    ctx.fill();
    ctx.save();
    ctx.translate(632, 52);
    ctx.scale(46 / 240, 46 / 240);
    ctx.fillStyle = '#1ed760';
    ctx.fill(spotifyIcon);
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ink;
    ctx.font = '48px sans-serif';
    ctx.fillText('Spotify', 804, 94);
    ctx.font = '36px sans-serif';
    ctx.fillText('Recommander System', 768, 143);
    ctx.fillStyle = C.green;
    ctx.font = '18px monospace';
    ctx.fillText('FIND THE NEXT TRACK', 768, 180);

    ctx.lineCap = 'round';
    ctx.strokeStyle = `${C.green}55`;
    ctx.lineWidth = 2;
    for (const node of MUSIC_LAYERS[0]!) {
      ctx.beginPath();
      ctx.moveTo(node.x, 215);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    }
    MUSIC_LAYERS.slice(0, -1).forEach((layer, i) => {
      layer.forEach((a, ai) => {
        MUSIC_LAYERS[i + 1]!.forEach((b, bi) => {
          const activity = Math.max(
            0,
            ...frame
              .filter((n) => n.route[i] === ai && n.route[i + 1] === bi)
              .map((n) => 1 - Math.abs(n.phase - (0.275 + i * 0.25)) / 0.125),
          );
          ctx.strokeStyle = C.green;
          ctx.globalAlpha = 0.38 + activity * 0.3;
          ctx.lineWidth = 2.8 + activity * 1.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
      });
    });
    ctx.globalAlpha = 1;
    for (const node of MUSIC_LAYERS[2]!) {
      MUSIC_OUTPUTS.forEach((output, i) => {
        ctx.strokeStyle = i === 0 ? `${C.green}77` : `${C.rejected}66`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(output.x, output.y);
        ctx.stroke();
      });
    }
    MUSIC_LAYERS.forEach((layer, i) => {
      layer.forEach((node, j) => {
        const active = musicNodeActivity(frame, i, j);
        ctx.fillStyle = C.green;
        ctx.globalAlpha = active * 0.13;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 27 + active * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.node;
        ctx.strokeStyle = C.green;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 23, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = C.green;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5 + active * 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    MUSIC_OUTPUTS.forEach((output, i) => {
      ctx.fillStyle = C.node;
      ctx.strokeStyle = i === 0 ? C.green : C.rejected;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(output.x, output.y, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    for (const note of frame) {
      ctx.save();
      ctx.translate(note.x, note.y);
      ctx.rotate(note.rotation);
      ctx.scale(note.scale, note.scale);
      ctx.globalAlpha = note.alpha;
      ctx.fillStyle = note.selected ? C.ink : C.rejected;
      ctx.fill(note.double ? double : single);
      ctx.restore();
    }
    ctx.fillStyle = C.green;
    ctx.font = '16px monospace';
    ctx.fillText('ILLUSTRATIVE SORTING', 768, 930);
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
