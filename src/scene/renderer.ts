import * as THREE from 'three';
import { sceneConfig } from './config';
import { createTerrain } from './terrain';
import type { SceneController, SceneProject } from './types';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = THREE.MathUtils.lerp;

export function createPortfolioScene(
  root: HTMLElement,
  projects: SceneProject[],
): SceneController {
  const hero = document.querySelector<HTMLElement>('[data-hero]')!;
  const gallery = document.querySelector<HTMLElement>('[data-gallery]')!;
  const preview = document.querySelector<HTMLElement>('[data-preview-panel]')!;
  const previewScene = document.querySelector<HTMLElement>(
    '[data-preview-scene]',
  )!;
  const dialog = document.querySelector<HTMLDialogElement>('#project-preview')!;
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
  const materials: THREE.Material[] = [terrain.material];
  const textures: THREE.Texture[] = [];
  const panels = projects.map((project, index) => {
    const anchor = document.querySelector<HTMLElement>(
      `[data-panel="${project.id}"]`,
    )!;
    const frame = new THREE.MeshStandardMaterial({
      color: '#5c6362',
      metalness: 0.6,
      roughness: 0.38,
      transparent: true,
    });
    const front = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      toneMapped: false,
      transparent: true,
    });
    const border = new THREE.LineBasicMaterial({
      color: '#a1acaa',
      transparent: true,
      opacity: 0.28,
    });
    materials.push(frame, front, border);
    const mesh = new THREE.Mesh(geometry, [
      frame,
      frame,
      frame,
      frame,
      front,
      frame,
    ]);
    mesh.add(new THREE.LineSegments(edges, border));
    mesh.visible = false;
    scene.add(mesh);
    return {
      anchor,
      mesh,
      frame,
      front,
      border,
      project,
      index,
      poster: undefined as THREE.Texture | undefined,
      video: undefined as THREE.VideoTexture | undefined,
      playing: false,
    };
  });
  let disposed = false;
  let paused = document.hidden;
  let frameId = 0;
  let width = 1;
  let height = 1;
  let texturesReady = false;
  let lastTime = 0;
  let progress = -1;
  let panelProgress = -1;
  let selectionMix = 0;
  let selected: string | undefined;
  let focusId: string | undefined;
  let previewRect: DOMRect | undefined;
  const events = new AbortController();
  const direction = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const position = new THREE.Vector3();
  const target = new THREE.Vector3();
  const accent = new THREE.Color();
  const defaultRim = new THREE.Color('#8cbbcc');
  const html = document.documentElement;

  function placeAtPixel(
    x: number,
    y: number,
    distance: number,
    destination: THREE.Vector3,
  ) {
    const visibleHeight =
      2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
    destination
      .copy(camera.position)
      .addScaledVector(direction, distance)
      .addScaledVector(right, (x / width - 0.5) * visibleHeight * camera.aspect)
      .addScaledVector(up, (0.5 - y / height) * visibleHeight);
    return visibleHeight / height;
  }
  function restorePosters() {
    delete html.dataset['panelsReady'];
    delete html.dataset['terrainReady'];
    delete html.dataset['selectedReady'];
  }
  function approach(
    current: number,
    destination: number,
    dt: number,
    duration: number,
  ) {
    if (Math.abs(current - destination) < 0.001) return destination;
    const next = mix(current, destination, 1 - Math.exp((-dt * 7) / duration));
    return Math.abs(next - destination) < 0.001 ? destination : next;
  }
  function render(now: number) {
    frameId = 0;
    if (disposed || paused) return;
    const heroRect = hero.getBoundingClientRect();
    const galleryRect = gallery.getBoundingClientRect();
    const visible =
      Boolean(selected) ||
      heroRect.bottom > 0 ||
      (galleryRect.top < height && galleryRect.bottom > 0);
    root.hidden = !visible;
    if (!visible) {
      restorePosters();
      lastTime = 0;
      return;
    }
    const dt = lastTime ? Math.min(100, now - lastTime) : 16.7;
    lastTime = now;
    const destination = clamp(
      (height * 0.9 - galleryRect.top) / (height * 0.9),
    );
    const selectionDestination = selected ? 1 : 0;
    if (progress < 0) progress = panelProgress = destination;
    progress = approach(
      progress,
      destination,
      dt,
      sceneConfig.timing.cameraDurationMs,
    );
    panelProgress = approach(
      panelProgress,
      destination,
      dt,
      sceneConfig.timing.revealDurationMs,
    );
    selectionMix = approach(
      selectionMix,
      selectionDestination,
      dt,
      sceneConfig.timing.cameraDurationMs,
    );
    root.dataset['state'] = selected
      ? 'selected'
      : progress <= 0.001
        ? 'hero'
        : progress >= 0.999
          ? 'overview'
          : 'reveal';
    root.dataset['progress'] = progress.toFixed(3);
    root.dataset['selectionProgress'] = selectionMix.toFixed(3);
    const desktop =
      width >= sceneConfig.panels.minWidth &&
      height >= sceneConfig.panels.minHeight;
    const poses = sceneConfig.camera[desktop ? 'desktop' : 'compact'];
    const travel = smooth(progress);
    camera.position
      .fromArray(poses.hero.position)
      .lerp(target.fromArray(poses.overview.position), travel);
    camera.position.z -= selectionMix * 0.6;
    camera.fov = mix(poses.hero.fov, poses.overview.fov, travel);
    camera.aspect = width / height;
    position
      .fromArray(poses.hero.target)
      .lerp(target.fromArray(poses.overview.target), travel);
    camera.lookAt(position);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.getWorldDirection(direction);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const scrollTerrainY = mix(
      heroRect.top + heroRect.height * 0.86,
      galleryRect.top + Math.min(galleryRect.height, height) * 0.82,
      travel,
    );
    const terrainY = mix(scrollTerrainY, height * 0.88, selectionMix);
    const terrainUnit = placeAtPixel(width * 0.48, terrainY, 24, position);
    terrain.points.position.copy(position);
    terrain.points.rotation.set(
      mix(0.24, 0.16, travel),
      -0.1 + travel * 0.06,
      -0.04,
    );
    terrain.points.scale.setScalar((terrainUnit * Math.max(width, 1100)) / 29);
    terrain.material.uniforms['opacity']!.value =
      mix(
        sceneConfig.terrain.heroOpacity,
        sceneConfig.terrain.overviewOpacity,
        travel,
      ) *
      (1 - selectionMix * 0.65);
    terrain.material.uniforms['overview']!.value = travel;
    const selectedProject = projects.find((project) => project.id === focusId);
    accent.set(selectedProject?.accent ?? '#8cbbcc');
    rim.color.copy(defaultRim).lerp(accent, selectionMix);
    rim.intensity = sceneConfig.lighting.rim * (1 + selectionMix * 0.5);
    if (selected) previewRect = preview.getBoundingClientRect();
    const showPanels =
      desktop && texturesReady && (panelProgress > 0.001 || Boolean(selected));
    for (const panel of panels) {
      const { anchor, mesh, index, front, frame, border, project } = panel;
      const focused = project.id === focusId;
      const opacity =
        (focused && selected
          ? 1
          : smooth((panelProgress - 0.03 * index) / (0.82 - 0.03 * index))) *
        (focused ? 1 : 1 - selectionMix);
      mesh.visible = showPanels && opacity > 0.001;
      if (!mesh.visible) continue;
      const rect = anchor.getBoundingClientRect();
      const amount = focused ? smooth(selectionMix) : 0;
      const end = previewRect ?? rect;
      const x = mix(
        rect.left + rect.width / 2,
        end.left + end.width / 2,
        amount,
      );
      const y = mix(
        rect.top + rect.height / 2 + (1 - panelProgress) * 80,
        end.top + end.height / 2,
        amount,
      );
      const distance = mix(18 + (index % 3) * 0.65, 14, amount);
      const unit = placeAtPixel(x, y, distance, mesh.position);
      mesh.quaternion.copy(camera.quaternion);
      mesh.rotateX(-sceneConfig.panels.tilt * mix(0.65, 0.2, amount));
      mesh.rotateY(
        ((index % 3) - 1) * sceneConfig.panels.tilt * mix(1.3, 0.35, amount),
      );
      mesh.rotateZ((index % 2 === 0 ? 1 : -1) * 0.012 * (1 - amount));
      const panelWidth =
        mix(rect.width * sceneConfig.panels.scale, end.width * 0.97, amount) *
        unit;
      mesh.scale.set(
        panelWidth,
        mix(rect.height * sceneConfig.panels.scale, end.height * 0.97, amount) *
          unit,
        panelWidth * sceneConfig.panels.thickness,
      );
      front.opacity = frame.opacity = opacity;
      border.opacity = opacity * mix(0.28, 0.65, amount);
      frame.color.set(focused ? project.accent : '#5c6362');
    }
    try {
      renderer.render(scene, camera);
      html.dataset['terrainReady'] = 'true';
      html.dataset['panelsReady'] = String(showPanels);
      html.dataset['selectedReady'] = String(showPanels && Boolean(selected));
    } catch {
      controller.setState({ kind: 'fallback', reason: 'load-error' });
      return;
    }
    if (
      Math.abs(progress - destination) > 0.001 ||
      Math.abs(panelProgress - destination) > 0.001 ||
      Math.abs(selectionMix - selectionDestination) > 0.001
    )
      invalidate();
    else if (!selected) focusId = undefined;
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
  [hero, gallery, preview].forEach((element) => observer.observe(element));
  const controller: SceneController = {
    setState(state) {
      if (disposed) return;
      if (state.kind === 'fallback') {
        controller.dispose();
        root.dataset['state'] = 'fallback';
        root.dataset['fallbackReason'] = state.reason;
        return;
      }
      selected = state.kind === 'selected' ? state.projectId : undefined;
      if (selected) focusId = selected;
      const parent = selected ? previewScene : root;
      if (renderer.domElement.parentElement !== parent)
        parent.append(renderer.domElement);
      delete html.dataset['selectedReady'];
      resize();
    },
    setMedia(id, video) {
      if (disposed) return;
      const panel = panels.find((item) => item.project.id === id);
      if (!panel) return;
      panel.playing = Boolean(video);
      if (video && !panel.video) {
        panel.video = new THREE.VideoTexture(video);
        panel.video.colorSpace = THREE.SRGBColorSpace;
        textures.push(panel.video);
      }
      panel.front.map =
        video && panel.video ? panel.video : (panel.poster ?? null);
      panel.front.needsUpdate = true;
      invalidate();
    },
    invalidate,
    resize,
    pause() {
      paused = true;
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastTime = 0;
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
  dialog.addEventListener('scroll', invalidate, {
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
    panels.map(async (panel) => {
      const texture = await loader.loadAsync(panel.project.poster.src);
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
      panel.poster = texture;
      if (!panel.playing) {
        panel.front.map = texture;
        panel.front.needsUpdate = true;
      }
    }),
  ).then((results) => {
    if (disposed) return;
    texturesReady = results.every((result) => result.status === 'fulfilled');
    if (!texturesReady) root.dataset['fallbackReason'] = 'load-error';
    invalidate();
  });
  resize();
  return controller;
}
