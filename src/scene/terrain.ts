import * as THREE from 'three';
import { sceneConfig } from './config';
import { terrainHeight } from './height';

// A decorative sum of Gaussian hills and valleys, not a fitted financial surface.
export function createTerrain() {
  const { columns, rows, width, depth, pointSize } = sceneConfig.terrain;
  const positions: number[] = [];
  const opacity: number[] = [];
  const colors: number[] = [];
  const slate = new THREE.Color('#627e88');
  const ochre = new THREE.Color('#8b754e');
  const color = new THREE.Color();
  for (let row = 0; row <= rows; row++) {
    const z = (row / rows - 0.5) * depth;
    for (let col = 0; col <= columns; col++) {
      const x = (col / columns - 0.5) * width;
      const height = terrainHeight(x, z);
      positions.push(x, height, z);
      const edge =
        Math.sin((Math.PI * col) / columns) * Math.sin((Math.PI * row) / rows);
      opacity.push(Math.pow(Math.max(0, edge), 0.6));
      color.copy(slate).lerp(ochre, Math.max(0, Math.min(1, height / 4)));
      colors.push(color.r, color.g, color.b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute(
    'pointOpacity',
    new THREE.Float32BufferAttribute(opacity, 1),
  );
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      pointSize: { value: pointSize },
      pixelRatio: { value: 1 },
      opacity: { value: sceneConfig.terrain.heroOpacity },
      overview: { value: 0 },
    },
    vertexShader: `
      attribute vec3 color;
      attribute float pointOpacity;
      varying vec3 vColor;
      varying float vOpacity;
      uniform float pointSize;
      uniform float pixelRatio;
      void main() {
        vColor = color;
        vOpacity = pointOpacity;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = clamp(pointSize * pixelRatio * 20.0 / -viewPosition.z, 1.0, 5.0 * pixelRatio);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vOpacity;
      uniform float opacity;
      uniform float overview;
      void main() {
        float distanceToCenter = length(gl_PointCoord - .5);
        float alpha = 1.0 - smoothstep(.25, .5, distanceToCenter);
        if (alpha < .01) discard;
        vec3 shade = mix(vColor, vec3(.43, .56, .59), overview);
        gl_FragColor = vec4(shade, alpha * vOpacity * opacity);
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, geometry, material };
}
