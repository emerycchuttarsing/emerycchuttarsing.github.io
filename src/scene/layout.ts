import * as THREE from 'three';
import { groundHeight } from './height';
import { orbitOffset } from './orbit';
import type { SceneProject } from './types';

// Larger panels share an elliptical orbit in world space. The HTML rows stay fixed.
export function panelLayout(
  project: SceneProject,
  width: number,
  angle: number,
  index: number,
  count: number,
  radius = 1,
  revealScale = 1,
) {
  const theta = angle + orbitOffset(index, count);
  const mobile = width < 640;
  const scale = (mobile ? 0.62 : 1) * 1.12 * revealScale;
  const x = Math.sin(theta) * (mobile ? 2.8 : 6.05) * radius;
  const z = Math.cos(theta) * (mobile ? 2.2 : 3.9) * radius - 0.6;
  const w = (project.featured ? 3.65 : 3.15) * scale;
  const h = (project.featured ? 4.05 : 3.55) * scale;
  return {
    position: new THREE.Vector3(x, groundHeight(x, z) + h / 2 + 0.04, z),
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        -0.012,
        -Math.sin(theta) * 0.52,
        Math.sin(theta) * -0.015,
      ),
    ),
    scale: new THREE.Vector3(w, h, 0.09),
    frontness: (Math.cos(theta) + 1) / 2,
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
