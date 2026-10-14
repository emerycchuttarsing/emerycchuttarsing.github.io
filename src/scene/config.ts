import type { SceneConfig } from './types';

// Starting values for the visual prototype, not measured performance guarantees.
export const sceneConfig: SceneConfig = {
  camera: {
    desktop: {
      hero: { position: [0, 4, 12], target: [0, 0, 0], fov: 35 },
      overview: { position: [0, 2, 16], target: [0, 0, 0], fov: 40 },
    },
    compact: {
      hero: { position: [0, 5, 16], target: [0, 0, 0], fov: 45 },
      overview: { position: [0, 3, 20], target: [0, 0, 0], fov: 50 },
    },
  },
  media: { desktopPlayingLimit: 2, constrainedPlayingLimit: 1 },
  quality: { maxPixelRatio: 1.5, targetFps: 60 },
  timing: { cameraDurationMs: 900, revealDurationMs: 600 },
};
