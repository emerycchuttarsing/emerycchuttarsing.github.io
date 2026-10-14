import * as THREE from 'three';
import { groundHeight } from './height';
import type { SceneProject } from './types';

// Stable world coordinates: each identity has its own place, independent of the HTML list.
const positions: Record<string, [number, number, number]> = {
  'rl-path-signatures': [-4.8, 0.8, 0.5],
  'signature-deep-hedging': [0, 1.4, -0.08],
  'music-recommendation': [4.8, 0.6, -0.5],
  'tinystories-transformer': [-7.3, -1.1, 0.68],
  'link-prediction': [-2.45, -1.8, 0.18],
  'visual-learning': [2.45, -1.6, -0.2],
  'retail-forecasting': [7.3, -1.0, -0.65],
};
export function panelLayout(project: SceneProject, width: number) {
  const [x, z, yaw] = positions[project.id] ?? [0, 0, 0];
  const mobile = width < 640;
  const scale = mobile ? 0.63 : 1;
  const px = x * (mobile ? 0.44 : 1);
  const pz = mobile ? (project.featured ? 1.2 : -3.2) : z;
  const w = (project.featured ? 2.5 : 1.85) * scale;
  const h = (project.featured ? 2.75 : 2.25) * scale;
  return {
    position: new THREE.Vector3(px, groundHeight(px, pz) + h / 2 + 0.04, pz),
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-0.015, yaw, (x / 7.3) * -0.012),
    ),
    scale: new THREE.Vector3(w, h, 0.085),
  };
}
export function projectedPanel(
  mesh: THREE.Mesh,
  camera: THREE.Camera,
  width: number,
  height: number,
) {
  const corners = [
    [-0.5, -0.5, 0.5],
    [0.5, -0.5, 0.5],
    [0.5, 0.5, 0.5],
    [-0.5, 0.5, 0.5],
  ].map(([x, y, z]) => {
    const v = new THREE.Vector3(x, y, z)
      .applyMatrix4(mesh.matrixWorld)
      .project(camera);
    return { x: ((v.x + 1) * width) / 2, y: ((1 - v.y) * height) / 2 };
  });
  return {
    corners,
    left: Math.min(...corners.map((v) => v.x)),
    right: Math.max(...corners.map((v) => v.x)),
    top: Math.min(...corners.map((v) => v.y)),
    bottom: Math.max(...corners.map((v) => v.y)),
    depth: mesh.position.distanceTo(camera.position),
  };
}
