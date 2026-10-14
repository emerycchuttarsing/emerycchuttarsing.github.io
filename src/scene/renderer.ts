import * as THREE from 'three';
import { sceneConfig } from './config';
import { createTerrain } from './terrain';
import { createGround } from './ground';
import { panelLayout, projectedPanel } from './layout';
import { mediaLight } from './lighting';
import { createPostprocessing } from './postprocessing';
import type { SceneController, SceneElements, SceneProject } from './types';

const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const smooth = (n: number) => {
  const t = clamp(n, 0, 1);
  return t * t * (3 - 2 * t);
};
function approach(
  current: number,
  destination: number,
  dt: number,
  duration: number,
) {
  const next = mix(current, destination, 1 - Math.exp((-dt * 7) / duration));
  return Math.abs(next - destination) < 0.001 ? destination : next;
}
export function createPortfolioScene(
  elements: SceneElements,
  projects: SceneProject[],
  onVisibility: (ids: string[]) => void,
): SceneController {
  const { root, section, hero, preview, previewScene, dialog, mode } = elements;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  root.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  scene.add(
    new THREE.HemisphereLight(
      '#d7e2df',
      '#171c1e',
      sceneConfig.lighting.ambient,
    ),
  );
  const key = new THREE.DirectionalLight('#b4c8c9', sceneConfig.lighting.key);
  key.position.set(-8, 9, 12);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#e2c79d', sceneConfig.lighting.rim);
  rim.position.set(10, 4, -3);
  scene.add(rim);
  const terrain = createTerrain();
  scene.add(terrain.points);
  const ground = createGround(projects.length);
  scene.add(ground.mesh);
  const effects = createPostprocessing(renderer, scene, camera);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const materials: THREE.Material[] = [terrain.material];
  const textures: THREE.Texture[] = [];
  const panels = projects.map((project, index) => {
    const frame = new THREE.MeshStandardMaterial({
      color: '#535b5a',
      metalness: 0.72,
      roughness: 0.26,
      transparent: true,
    });
    const front = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.65, 1.65, 1.65),
      transparent: true,
      toneMapped: false,
    });
    const border = new THREE.LineBasicMaterial({
      color: '#c4d0ce',
      transparent: true,
      opacity: 0.32,
    });
    const mesh = new THREE.Mesh(geometry, [
      frame,
      frame,
      frame,
      frame,
      front,
      frame,
    ]);
    mesh.add(new THREE.LineSegments(edgeGeometry, border));
    mesh.visible = false;
    scene.add(mesh);
    materials.push(frame, front, border);
    return {
      project,
      index,
      mesh,
      frame,
      front,
      border,
      poster: undefined as THREE.Texture | undefined,
      video: undefined as THREE.VideoTexture | undefined,
      element: undefined as HTMLVideoElement | undefined,
      emphasis: 0,
    };
  });
  let disposed = false,
    paused = document.hidden,
    frameId = 0,
    width = 1,
    height = 1,
    texturesReady = false,
    lastTime = 0;
  let progress = mode === 'index' ? 1 : -1,
    panelProgress = progress,
    selectionMix = 0;
  let selected: string | undefined,
    focusId: string | undefined,
    activeId: string | undefined;
  const events = new AbortController();
  const html = document.documentElement;
  const direction = new THREE.Vector3(),
    right = new THREE.Vector3(),
    up = new THREE.Vector3();
  const position = new THREE.Vector3(),
    target = new THREE.Vector3(),
    destinationScale = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const color = new THREE.Color();
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
  function render(now: number) {
    frameId = 0;
    if (disposed || paused) return;
    const rect = section.getBoundingClientRect();
    const heroRect = hero?.getBoundingClientRect();
    const visible =
      Boolean(selected) ||
      (heroRect ? heroRect.bottom > 0 : false) ||
      (rect.top < height && rect.bottom > 0);
    root.hidden = !visible;
    if (!visible) {
      onVisibility([]);
      lastTime = 0;
      return;
    }
    const dt = lastTime ? Math.min(100, now - lastTime) : 16.7;
    lastTime = now;
    const destination =
      mode === 'index'
        ? 1
        : clamp((height * 0.9 - rect.top) / (height * 0.9), 0, 1);
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
      selected ? 1 : 0,
      dt,
      sceneConfig.timing.selectionDurationMs,
    );
    const travel = smooth(progress);
    root.dataset['state'] = selected
      ? 'selected'
      : progress === 0
        ? 'hero'
        : progress === 1
          ? 'overview'
          : 'reveal';
    root.dataset['progress'] = progress.toFixed(3);
    root.dataset['selectionProgress'] = selectionMix.toFixed(3);
    const mobile = width < 640;
    const poses = sceneConfig.camera[mobile ? 'compact' : 'desktop'];
    target.fromArray(poses.overview.position);
    const worldWidth = mobile ? 8.5 : 18.8;
    target.z = Math.max(
      target.z,
      worldWidth /
        (2 *
          Math.tan(THREE.MathUtils.degToRad(poses.overview.fov / 2)) *
          (width / height)),
    );
    if (!mobile) target.y = 4.8 * (target.z / 36);
    camera.position.fromArray(poses.hero.position).lerp(target, travel);
    camera.fov = mix(poses.hero.fov, poses.overview.fov, travel);
    camera.aspect = width / height;
    position
      .fromArray(poses.hero.target)
      .lerp(target.fromArray(poses.overview.target), travel);
    camera.lookAt(position);
    const compactShift =
      width < 640
        ? height / 2 - 270
        : width < 1000
          ? height / 2 - 390
          : Math.min(0, height / 2 - 400);
    camera.setViewOffset(
      width,
      height,
      0,
      (-rect.top + compactShift) * travel * (1 - selectionMix),
      width,
      height,
    );
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.getWorldDirection(direction);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const heroY = heroRect
      ? heroRect.top + heroRect.height * 0.86
      : height * 0.86;
    const terrainUnit = placeAtPixel(width * 0.48, heroY, 24, position);
    terrain.points.position.copy(position).multiplyScalar(1 - travel);
    terrain.points.rotation.set(
      0.24 * (1 - travel),
      -0.1 * (1 - travel),
      -0.04 * (1 - travel),
    );
    const heroScale = (terrainUnit * Math.max(width, 1100)) / 29;
    terrain.points.scale.set(
      mix(heroScale, 1, travel),
      mix(heroScale, 0.24, travel),
      mix(heroScale, 1, travel),
    );
    terrain.material.uniforms['opacity']!.value =
      sceneConfig.terrain.heroOpacity *
      (1 - smooth((progress - 0.2) / 0.6)) *
      (1 - selectionMix);
    terrain.material.uniforms['overview']!.value = travel;
    ground.uniforms.opacity.value =
      smooth((progress - 0.18) / 0.56) * (1 - selectionMix * 0.88);
    ground.mesh.visible = ground.uniforms.opacity.value > 0.001;
    const end = preview.getBoundingClientRect();
    let highlighting = false;
    const showPanels =
      texturesReady && (panelProgress > 0.02 || Boolean(selected));
    for (const panel of panels) {
      const { project, index, mesh, front, frame, border } = panel;
      const layout = panelLayout(project, width);
      const desired = activeId === project.id ? 1 : 0;
      panel.emphasis = approach(
        panel.emphasis,
        desired,
        dt,
        sceneConfig.timing.highlightDurationMs,
      );
      if (panel.emphasis !== desired) highlighting = true;
      const amount = focusId === project.id ? smooth(selectionMix) : 0;
      const opacity =
        (selected && focusId === project.id
          ? 1
          : smooth((panelProgress - 0.27 - 0.025 * index) / 0.55)) *
        (focusId === project.id ? 1 : 1 - selectionMix);
      mesh.visible = showPanels && opacity > 0.001;
      mesh.position.copy(layout.position);
      mesh.position.y += (1 - panelProgress) * -0.35 + panel.emphasis * 0.06;
      mesh.scale.copy(layout.scale).multiplyScalar(1 + panel.emphasis * 0.035);
      mesh.quaternion.copy(layout.quaternion);
      if (amount > 0) {
        const unit = placeAtPixel(
          end.left + end.width / 2,
          end.top + end.height / 2,
          16,
          position,
        );
        mesh.position.lerp(position, amount);
        destinationScale.set(
          end.width * 0.97 * unit,
          end.height * 0.97 * unit,
          0.08,
        );
        mesh.scale.lerp(destinationScale, amount);
        quaternion.copy(camera.quaternion);
        mesh.quaternion.slerp(quaternion, amount);
      }
      const map = front.map;
      if (map) {
        const aspect = mesh.scale.x / mesh.scale.y;
        map.repeat.set(Math.min(1, aspect / 1.6), Math.min(1, 1.6 / aspect));
        map.offset.set((1 - map.repeat.x) / 2, (1 - map.repeat.y) / 2);
      }
      front.opacity = frame.opacity = opacity;
      border.opacity = opacity * (0.22 + panel.emphasis * 0.4);
      front.color.setScalar(1.7 + panel.emphasis * 0.45);
      frame.color
        .set(project.accent)
        .multiplyScalar(0.5 + panel.emphasis * 0.3);
      ground.uniforms.lights.value[index]!.copy(layout.position).y = 1.35;
      mediaLight(project.id, project.accent, panel.element, color);
      ground.uniforms.colors.value[index]!.copy(color);
      ground.uniforms.strengths.value[index] = mix(1, 1.8, panel.emphasis);
    }
    try {
      if (travel > 0.995 || selected) {
        renderer.setClearColor(0x000000, 1);
        effects.render();
      } else {
        renderer.setClearColor(0x000000, 0);
        renderer.render(scene, camera);
      }
      html.dataset['terrainReady'] = 'true';
      html.dataset['panelsReady'] = String(showPanels);
      html.dataset['selectedReady'] = String(showPanels && Boolean(selected));
      scene.updateMatrixWorld(true);
      const bounds = panels.map((p) => ({
        id: p.project.id,
        visible: p.mesh.visible && p.front.opacity > 0.1,
        ...projectedPanel(p.mesh, camera, width, height),
      }));
      root.dataset['panelBounds'] = JSON.stringify(bounds);
      onVisibility(
        bounds
          .filter(
            (p) =>
              p.visible &&
              p.bottom > 0 &&
              p.top < height &&
              p.right > 0 &&
              p.left < width,
          )
          .map((p) => p.id),
      );
      root.dataset['gpuResources'] = JSON.stringify(renderer.info.memory);
    } catch {
      controller.setState({ kind: 'fallback', reason: 'load-error' });
      return;
    }
    if (
      progress !== destination ||
      panelProgress !== destination ||
      selectionMix !== (selected ? 1 : 0) ||
      highlighting
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
      Math.sqrt(sceneConfig.quality.maxRenderPixels / (width * height)),
    );
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    effects.resize(width, height, ratio);
    terrain.material.uniforms['pixelRatio']!.value = ratio;
    invalidate();
  }
  const observer = new ResizeObserver(() => resize());
  [hero, section, preview].forEach((element) => {
    if (element) observer.observe(element);
  });
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
    setActive(id) {
      activeId = id;
      root.dataset['activeProject'] = id ?? '';
      invalidate();
    },
    setMedia(id, video) {
      if (disposed) return;
      const panel = panels.find((p) => p.project.id === id);
      if (!panel) return;
      panel.element = video ?? undefined;
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
      ground.dispose();
      effects.dispose();
      geometry.dispose();
      edgeGeometry.dispose();
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
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
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      textures.push(texture);
      panel.poster = texture;
      if (!panel.element) {
        panel.front.map = texture;
        panel.front.needsUpdate = true;
      }
    }),
  ).then((results) => {
    if (disposed) return;
    texturesReady = results.every((r) => r.status === 'fulfilled');
    if (!texturesReady) root.dataset['fallbackReason'] = 'load-error';
    invalidate();
  });
  resize();
  return controller;
}
