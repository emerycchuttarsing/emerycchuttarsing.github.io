import type { Vector3Tuple } from 'three';

export interface SceneProject {
  id: string;
  href: string;
  title: string;
  summary: string;
  featured: boolean;
  poster: { src: string; alt: string };
  video?: string;
  accent: string;
}

export type SceneState =
  | { kind: 'hero' }
  | { kind: 'reveal'; progress: number }
  | { kind: 'overview' }
  | { kind: 'selected'; projectId: string }
  | {
      kind: 'fallback';
      reason: 'unsupported' | 'reduced-motion' | 'context-lost' | 'load-error';
    };

export interface CameraPose {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
}

export interface SceneConfig {
  camera: Record<
    'desktop' | 'compact',
    Record<'hero' | 'overview', CameraPose>
  >;
  media: { desktopPlayingLimit: number; constrainedPlayingLimit: number };
  quality: { maxPixelRatio: number; targetFps: number };
  timing: { cameraDurationMs: number; revealDurationMs: number };
}

export interface SceneController {
  setState(state: SceneState): void;
  resize(width: number, height: number): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}
