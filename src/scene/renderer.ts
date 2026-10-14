import * as THREE from 'three';
import { sceneConfig } from './config';
import { createTerrain } from './terrain';
import type { SceneController, SceneProject, SceneState } from './types';

export function createPortfolioScene(
  root: HTMLElement,
  projects: SceneProject[],
): SceneController {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const gallery = document.querySelector<HTMLElement>('[data-gallery]');
  if (!hero || !gallery) throw new Error('Missing scene sections.');
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  root.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  scene.add(
    new THREE.HemisphereLight(
      '#f1ede4',
      '#566570',
      sceneConfig.lighting.ambient,
    ),
  );
  const key = new THREE.DirectionalLight('#e5d3ad', sceneConfig.lighting.key);
  key.position.set(-8, 12, 10);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#8cbbcc', sceneConfig.lighting.rim);
  rim.position.set(12, 3, 6);
  scene.add(rim);
  const terrain = createTerrain();
  scene.add(terrain.points);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const edges = new THREE.EdgesGeometry(geometry);
  const border = new THREE.LineBasicMaterial({
    color: '#a1acaa',
    transparent: true,
    opacity: 0.28,
  });
  const materials: THREE.Material[] = [terrain.material, border];
  const textures: THREE.Texture[] = [];
  const panels = projects.map((project, index) => {
    const anchor = document.querySelector<HTMLElement>(
      `[data-panel="${project.id}"]`,
    );
    if (!anchor) throw new Error(`Missing panel: ${project.id}`);
    const frame = new THREE.MeshStandardMaterial({
      color: '#5c6362',
      metalness: 0.6,
      roughness: 0.38,
    });
    const front = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      toneMapped: false,
    });
    materials.push(frame, front);
    const mesh = new THREE.Mesh(geometry, [
      frame,
      frame,
      frame,
      frame,
      front,
      frame,
    ]);
    const outline = new THREE.LineSegments(edges, border);
    mesh.add(outline);
    mesh.visible = false;
    scene.add(mesh);
    return { anchor, mesh, front, project, index };
  });
  let disposed = false;
  let paused = document.hidden;
  let frameId = 0;
  let width = 0;
  let height = 0;
  let texturesReady = false;
  let state: SceneState = { kind: 'hero' };
  const events = new AbortController();
  const direction = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const position = new THREE.Vector3();
  const html = document.documentElement;

  // A camera-facing plane maps DOM pixels into the shared perspective scene.
  function placeAtPixel(
    x: number,
    y: number,
    distance: number,
    target: THREE.Vector3,
  ) {
    const visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
    target
      .copy(camera.position)
      .addScaledVector(direction, distance)
      .addScaledVector(right, (x / width - 0.5) * visibleHeight * camera.aspect)
      .addScaledVector(up, (0.5 - y / height) * visibleHeight);
    return visibleHeight / height;
  }

  function restorePosters() {
    delete html.dataset['panelsReady'];
    delete html.dataset['terrainReady'];
  }

  function render() {
    frameId = 0;
    if (disposed || paused) return;
    const heroRect = hero!.getBoundingClientRect();
    const galleryRect = gallery!.getBoundingClientRect();
    const visible =
      heroRect.bottom > 0 ||
      (galleryRect.top < height && galleryRect.bottom > 0);
    root.hidden = !visible;
    if (!visible) {
      restorePosters();
      return;
    }
    const overview = galleryRect.top <= height / 2;
    state = { kind: overview ? 'overview' : 'hero' };
    root.dataset['state'] = state.kind;
    const desktop =
      width >= sceneConfig.panels.minWidth &&
      height >= sceneConfig.panels.minHeight;
    const pose =
      sceneConfig.camera[desktop ? 'desktop' : 'compact'][
        overview ? 'overview' : 'hero'
      ];
    camera.position.fromArray(pose.position);
    camera.fov = pose.fov;
    camera.aspect = width / height;
    camera.lookAt(...pose.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.getWorldDirection(direction);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const terrainY = overview
      ? galleryRect.top + Math.min(galleryRect.height, height) * 0.82
      : heroRect.top + heroRect.height * 0.86;
    const terrainUnit = placeAtPixel(width * 0.48, terrainY, 24, position);
    terrain.points.position.copy(position);
    terrain.points.rotation.set(0.24, -0.1, -0.04);
    terrain.points.scale.setScalar((terrainUnit * Math.max(width, 1100)) / 29);
    terrain.material.uniforms['opacity']!.value = overview
      ? sceneConfig.terrain.overviewOpacity
      : sceneConfig.terrain.heroOpacity;
    terrain.material.uniforms['overview']!.value = overview ? 1 : 0;
    const showPanels = desktop && overview && texturesReady;
    for (const { anchor, mesh, index } of panels) {
      mesh.visible = showPanels;
      if (!showPanels) continue;
      const rect = anchor.getBoundingClientRect();
      const distance = 18 + (index % 3) * 0.65;
      const unit = placeAtPixel(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        distance,
        mesh.position,
      );
      mesh.quaternion.copy(camera.quaternion);
      mesh.rotateX(-sceneConfig.panels.tilt * 0.65);
      mesh.rotateY(((index % 3) - 1) * sceneConfig.panels.tilt * 1.3);
      mesh.rotateZ((index % 2 === 0 ? 1 : -1) * 0.012);
      const panelWidth = rect.width * unit * sceneConfig.panels.scale;
      mesh.scale.set(
        panelWidth,
        rect.height * unit * sceneConfig.panels.scale,
        panelWidth * sceneConfig.panels.thickness,
      );
    }
    try {
      renderer.render(scene, camera);
      html.dataset['terrainReady'] = 'true';
      html.dataset['panelsReady'] = String(showPanels);
    } catch {
      controller.dispose();
      root.dataset['state'] = 'fallback';
    }
  }

  function invalidate() {
    if (!frameId && !disposed && !paused)
      frameId = requestAnimationFrame(render);
  }
  function resize(
    nextWidth = document.documentElement.clientWidth,
    nextHeight = window.innerHeight,
  ) {
    if (disposed) return;
    width = Math.max(1, nextWidth);
    height = Math.max(1, nextHeight);
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      sceneConfig.quality.maxPixelRatio,
    );
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    terrain.material.uniforms['pixelRatio']!.value = ratio;
    invalidate();
  }
  const observer = new ResizeObserver(() => resize());
  observer.observe(hero);
  observer.observe(gallery);
  const controller: SceneController = {
    setState(nextState) {
      // Animated reveal and selection are reserved for milestone 4.
      if (nextState.kind === 'fallback') {
        controller.dispose();
        root.dataset['state'] = 'fallback';
      } else {
        state = nextState;
        invalidate();
      }
    },
    resize,
    pause() {
      paused = true;
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
    resume() {
      paused = false;
      resize();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frameId);
      events.abort();
      observer.disconnect();
      restorePosters();
      terrain.geometry.dispose();
      geometry.dispose();
      edges.dispose();
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
  window.addEventListener('scroll', invalidate, {
    passive: true,
    signal: events.signal,
  });
  window.addEventListener('resize', () => resize(), {
    passive: true,
    signal: events.signal,
  });
  document.addEventListener(
    'visibilitychange',
    () => (document.hidden ? controller.pause() : controller.resume()),
    { signal: events.signal },
  );
  renderer.domElement.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      controller.setState({ kind: 'fallback', reason: 'context-lost' });
    },
    { signal: events.signal },
  );
  const loader = new THREE.TextureLoader();
  void Promise.allSettled(
    panels.map(async ({ project, front }) => {
      const texture = await loader.loadAsync(project.poster.src);
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy(),
      );
      texture.repeat.y = 0.94;
      texture.offset.y = 0.03;
      textures.push(texture);
      front.map = texture;
      front.needsUpdate = true;
    }),
  ).then((results) => {
    if (disposed) return;
    texturesReady = results.every((result) => result.status === 'fulfilled');
    invalidate();
  });
  resize();
  return controller;
}
