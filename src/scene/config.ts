import type { SceneConfig } from './types';

export const sceneConfig: SceneConfig = {
  camera: {
    desktop: {
      hero: { position: [0, 3, 17], target: [0, 0, 0], fov: 38 },
      overview: { position: [0, 5.5, 36], target: [0, 1.85, 0], fov: 18 },
    },
    compact: {
      hero: { position: [0, 4, 19], target: [0, 0, 0], fov: 44 },
      overview: { position: [0, 5, 30], target: [0, 0.5, 0], fov: 30 },
    },
  },
  terrain: {
    columns: 180,
    rows: 100,
    width: 34,
    depth: 16,
    pointSize: 2.15,
    heroOpacity: 0.82,
  },
  orbit: { revolutionSeconds: 90, maxFocusSpeed: 1.1, blurRadius: 2.7 },
  lighting: { ambient: 1.2, key: 3.2, rim: 2.4 },
  media: { desktopPlayingLimit: 2, constrainedPlayingLimit: 1 },
  quality: { maxPixelRatio: 2, maxRenderPixels: 8_388_608, targetFps: 60 },
  timing: {
    cameraDurationMs: 900,
    revealDurationMs: 650,
    selectionDurationMs: 750,
    highlightDurationMs: 280,
  },
};
