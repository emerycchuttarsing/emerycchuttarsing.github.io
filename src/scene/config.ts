import type { SceneConfig } from './types';

export const sceneConfig: SceneConfig = {
  camera: {
    desktop: {
      hero: { position: [0, 3, 17], target: [0, 0, 0], fov: 38 },
      overview: { position: [0, 1.5, 20], target: [0, 0, 0], fov: 42 },
    },
    compact: {
      hero: { position: [0, 4, 19], target: [0, 0, 0], fov: 44 },
      overview: { position: [0, 2, 22], target: [0, 0, 0], fov: 48 },
    },
  },
  terrain: {
    columns: 180,
    rows: 100,
    width: 34,
    depth: 16,
    pointSize: 2.15,
    heroOpacity: 0.82,
    overviewOpacity: 0.24,
  },
  panels: {
    minWidth: 1100,
    minHeight: 800,
    scale: 0.95,
    thickness: 0.025,
    tilt: 0.075,
  },
  lighting: { ambient: 2.2, key: 3.5, rim: 2.4 },
  media: { desktopPlayingLimit: 2, constrainedPlayingLimit: 1 },
  quality: { maxPixelRatio: 1.5, targetFps: 60 },
  timing: { cameraDurationMs: 900, revealDurationMs: 600 },
};
