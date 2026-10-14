import * as THREE from 'three';
import curves from '../data/media-colors.json';
const samples = curves as Record<
  string,
  { duration: number; colors: number[][] }
>;
const next = new THREE.Color();
export function mediaLight(
  id: string,
  accent: string,
  video: HTMLVideoElement | undefined,
  result: THREE.Color,
) {
  const curve = samples[id];
  if (!video || video.paused || !curve) return result.set(accent);
  const position =
    ((video.currentTime % curve.duration) / curve.duration) *
    curve.colors.length;
  const index = Math.floor(position);
  result
    .fromArray(curve.colors[index % curve.colors.length]!)
    .convertSRGBToLinear();
  next
    .fromArray(curve.colors[(index + 1) % curve.colors.length]!)
    .convertSRGBToLinear();
  // Accent keeps each scientific topic recognizable as the media luminance changes.
  return result.lerp(next, position - index).multiplyScalar(1.4);
}
