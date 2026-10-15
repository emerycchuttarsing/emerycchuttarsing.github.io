import * as THREE from 'three';
import { sceneConfig } from './config';
import { createTerrain } from './terrain';
import { createGround } from './ground';
import { panelLayout, projectedPanel } from './layout';
import { mediaLight } from './lighting';
import { createPostprocessing } from './postprocessing';
import { createOrbit } from './orbit';
import { orbitReveal } from './reveal';
import { createPanelMaterial } from './panel-material';
import { createBitcoinTextureCanvas } from './bitcoin-texture';
import { createHedgeTextureCanvas } from './hedging-texture';
import { createMusicTextureCanvas } from './music-texture';
import { createEmbeddingTextureCanvas } from './embedding-texture';
import { createLinkTextureCanvas } from './link-texture';
import { createVisionTextureCanvas } from './vision-texture';
import { createRetailTextureCanvas } from './retail-texture';
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
  const orbit = createOrbit(projects.length);
  let motionEnabled = true;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  // All five frame faces share one draw, with the image as a separate face.
  const indices = Array.from(geometry.index!.array);
  geometry.setIndex([
    ...indices.slice(0, 24),
    ...indices.slice(30),
    ...indices.slice(24, 30),
  ]);
  geometry.clearGroups();
  geometry.addGroup(0, 30, 0);
  geometry.addGroup(30, 6, 1);
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
    const surface = createPanelMaterial();
    const front = surface.material;
    const border = new THREE.LineBasicMaterial({
      color: '#c4d0ce',
      transparent: true,
      opacity: 0.32,
    });
    const mesh = new THREE.Mesh(geometry, [frame, front]);
    mesh.add(new THREE.LineSegments(edgeGeometry, border));
    mesh.visible = false;
    scene.add(mesh);
    materials.push(frame, front, border);
    const animation =
      project.animation === 'bitcoin-price'
        ? createBitcoinTextureCanvas()
        : project.animation === 'hedge-rebalancing'
          ? createHedgeTextureCanvas()
          : project.animation === 'music-sorting'
            ? createMusicTextureCanvas()
            : project.animation === 'embedding-space'
              ? createEmbeddingTextureCanvas()
              : project.animation === 'link-signal'
                ? createLinkTextureCanvas()
                : project.animation === 'vision-features'
                  ? createVisionTextureCanvas()
                  : project.animation === 'retail-demand'
                    ? createRetailTextureCanvas()
                    : undefined;
    const animationTexture = animation
      ? new THREE.CanvasTexture(animation.canvas)
      : undefined;
    if (animationTexture) {
      animationTexture.colorSpace = THREE.SRGBColorSpace;
      animationTexture.minFilter = THREE.LinearMipmapLinearFilter;
      animationTexture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      textures.push(animationTexture);
      // Raster-based animations keep the poster until their images are loaded.
      if (!animation || !('ready' in animation)) front.map = animationTexture;
    }
    return {
      project,
      index,
      surface,
      mesh,
      frame,
      front,
      border,
      poster: undefined as THREE.Texture | undefined,
      video: undefined as THREE.VideoTexture | undefined,
      element: undefined as HTMLVideoElement | undefined,
      animation,
      animationTexture,
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
    selectionMix = 0,
    attentionMix = 0;
  let selected: string | undefined,
    focusId: string | undefined,
    activeId: string | undefined;
  const events = new AbortController();
  let hoveredProject: string | undefined;
  let previewHovered = false;
  let visibleProjects = new Set<string>();
  const animationWanted = (id: string) =>
    motionEnabled &&
    !paused &&
    visibleProjects.has(id) &&
    (selected ? selected === id && previewHovered : hoveredProject === id);
  function stopAnimations() {
    for (const panel of panels) panel.animation?.stop();
    data(root, 'priceMotion', 'paused');
    data(root, 'hedgeMotion', 'paused');
    data(root, 'musicMotion', 'paused');
    data(root, 'embeddingMotion', 'paused');
    data(root, 'linkMotion', 'paused');
    data(root, 'visionMotion', 'paused');
    data(root, 'retailMotion', 'paused');
  }
  const rows = section.querySelector('[data-project-rows]');
  rows?.addEventListener(
    'pointerover',
    (event) => {
      if ((event as PointerEvent).pointerType === 'touch') return;
      const next =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-project-id]')?.dataset[
              'projectId'
            ]
          : undefined;
      if (next === hoveredProject) return;
      hoveredProject = next;
      stopAnimations();
      invalidate();
    },
    { signal: events.signal },
  );
  rows?.addEventListener(
    'pointerleave',
    () => {
      hoveredProject = undefined;
      stopAnimations();
      invalidate();
    },
    { signal: events.signal },
  );
  preview.addEventListener(
    'pointerenter',
    (event) => {
      if (event.pointerType === 'touch') return;
      previewHovered = true;
      invalidate();
    },
    { signal: events.signal },
  );
  preview.addEventListener(
    'pointerleave',
    () => {
      previewHovered = false;
      stopAnimations();
      invalidate();
    },
    { signal: events.signal },
  );
  const html = document.documentElement;
  const direction = new THREE.Vector3(),
    right = new THREE.Vector3(),
    up = new THREE.Vector3();
  const position = new THREE.Vector3(),
    target = new THREE.Vector3(),
    destinationScale = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const color = new THREE.Color();
  let layoutDirty = true;
  let sectionRect = section.getBoundingClientRect();
  let heroBounds = hero?.getBoundingClientRect();
  let lastDiagnostics = -Infinity;
  function data(element: HTMLElement, name: string, value: string) {
    if (element.dataset[name] !== value) element.dataset[name] = value;
  }
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
    if (layoutDirty) {
      sectionRect = section.getBoundingClientRect();
      heroBounds = hero?.getBoundingClientRect();
      layoutDirty = false;
    }
    const rect = sectionRect;
    const heroRect = heroBounds;
    const visible =
      Boolean(selected) ||
      (heroRect ? heroRect.bottom > 0 : false) ||
      (rect.top < height && rect.bottom > 0);
    if (root.hidden === visible) root.hidden = !visible;
    if (!visible) {
      visibleProjects.clear();
      stopAnimations();
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
    data(
      root,
      'state',
      selected
        ? 'selected'
        : progress === 0
          ? 'hero'
          : progress === 1
            ? 'overview'
            : 'reveal',
    );
    data(root, 'progress', progress.toFixed(3));
    data(root, 'selectionProgress', selectionMix.toFixed(3));
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
    if (!mobile) target.y = poses.overview.position[1] * (target.z / 36);
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
    terrain.points.visible =
      terrain.material.uniforms['opacity']!.value > 0.001;
    ground.uniforms.opacity.value =
      smooth((progress - 0.18) / 0.56) * (1 - selectionMix * 0.88);
    ground.mesh.visible = ground.uniforms.opacity.value > 0.001;
    attentionMix = approach(attentionMix, activeId ? 1 : 0, dt, 700);
    const reveal = orbitReveal(panelProgress);
    const orbitEnabled =
      motionEnabled && !selected && selectionMix === 0 && panelProgress > 0.2;
    const orbitMoving = orbit.update(dt / 1000, orbitEnabled);
    const orbitState = !motionEnabled
      ? 'paused'
      : selected
        ? 'preview'
        : activeId
          ? orbit.settled
            ? 'focused'
            : 'focusing'
          : 'drifting';
    const previousOrbitState = root.dataset['orbitState'];
    data(root, 'orbitState', orbitState);
    const diagnosticsDue =
      now - lastDiagnostics >= 100 ||
      previousOrbitState !== orbitState ||
      !orbitMoving;
    if (diagnosticsDue) {
      data(root, 'orbitAngle', orbit.angle.toFixed(6));
      data(root, 'orbitVelocity', orbit.velocity.toFixed(6));
      data(root, 'orbitRadius', reveal.radius.toFixed(3));
      data(root, 'revealAngle', reveal.angle.toFixed(6));
    }
    const end = selectionMix > 0 ? preview.getBoundingClientRect() : undefined;
    let highlighting = false;
    const showPanels =
      texturesReady && (panelProgress > 0.02 || Boolean(selected));
    for (const panel of panels) {
      const { project, index, mesh, front, frame, border } = panel;
      const layout = panelLayout(
        project,
        width,
        orbit.angle + reveal.angle,
        index,
        projects.length,
        reveal.radius,
        reveal.scale,
      );
      const desired = activeId === project.id ? 1 : 0;
      panel.emphasis = approach(
        panel.emphasis,
        desired,
        dt,
        sceneConfig.timing.highlightDurationMs,
      );
      if (panel.emphasis !== desired) highlighting = true;
      const amount = focusId === project.id ? smooth(selectionMix) : 0;
      const background = mix(1, 0.82, attentionMix * (1 - panel.emphasis));
      const depthOpacity = mix(0.52, 1, layout.frontness);
      const opacity =
        (selected && focusId === project.id
          ? 1
          : smooth((panelProgress - 0.16 - 0.012 * index) / 0.48)) *
        (focusId === project.id ? 1 : 1 - selectionMix) *
        mix(depthOpacity * background, 1, Math.max(panel.emphasis, amount));
      mesh.visible = showPanels && opacity > 0.001;
      mesh.position.copy(layout.position);
      mesh.position.y += (1 - panelProgress) * -0.35 + panel.emphasis * 0.06;
      mesh.scale.copy(layout.scale).multiplyScalar(1 + panel.emphasis * 0.035);
      mesh.quaternion.copy(layout.quaternion);
      if (amount > 0 && end) {
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
      if (panel.animation && panel.animationTexture) {
        if (
          panel.animation.tick(now, mesh.visible && animationWanted(project.id))
        )
          panel.animationTexture.needsUpdate = true;
        if (diagnosticsDue) {
          const prefix =
            project.animation === 'bitcoin-price'
              ? 'price'
              : project.animation === 'hedge-rebalancing'
                ? 'hedge'
                : project.animation === 'music-sorting'
                  ? 'music'
                  : project.animation === 'embedding-space'
                    ? 'embedding'
                    : project.animation === 'vision-features'
                      ? 'vision'
                      : project.animation === 'retail-demand'
                        ? 'retail'
                        : 'link';
          data(
            root,
            `${prefix}Motion`,
            panel.animation.running ? 'running' : 'paused',
          );
          data(root, `${prefix}Time`, panel.animation.elapsed.toFixed(3));
          data(root, `${prefix}Frames`, String(panel.animation.frames));
        }
      }
      const map = front.map;
      if (map) {
        const aspect = mesh.scale.x / mesh.scale.y;
        map.repeat.set(Math.min(1, aspect / 1.6), Math.min(1, 1.6 / aspect));
        map.offset.set((1 - map.repeat.x) / 2, (1 - map.repeat.y) / 2);
      }
      panel.surface.pixelRatio.value = renderer.getPixelRatio();
      const restingBlur = motionEnabled
        ? sceneConfig.orbit.blurRadius + (1 - layout.frontness) * 1.5
        : 0;
      panel.surface.blur.value =
        restingBlur * (1 - panel.emphasis) * (1 - amount);
      front.opacity = frame.opacity = opacity;
      border.opacity = opacity * (0.22 + panel.emphasis * 0.16);
      // Preserve photographic detail and keep light artwork below bloom.
      front.color.setScalar(
        project.animation === 'music-sorting'
          ? 0.68 + panel.emphasis * 0.06
          : project.animation === 'vision-features'
            ? 0.92 + panel.emphasis * 0.08
            : project.animation === 'retail-demand'
              ? 1.1 + panel.emphasis * 0.12
              : 1.7 + panel.emphasis * 0.22,
      );
      frame.color
        .set(project.accent)
        .multiplyScalar(0.5 + panel.emphasis * 0.16);
      ground.uniforms.lights.value[index]!.copy(layout.position).y = 1.35;
      mediaLight(project.id, project.accent, panel.element, color);
      ground.uniforms.colors.value[index]!.copy(color);
      ground.uniforms.strengths.value[index] =
        mix(1, 1.3, panel.emphasis) *
        mix(0.65, 1, layout.frontness) *
        background;
    }
    try {
      if (travel > 0.995 || selected) {
        renderer.setClearColor(0x000000, 1);
        effects.render();
      } else {
        renderer.setClearColor(0x000000, 0);
        renderer.render(scene, camera);
      }
      data(html, 'terrainReady', 'true');
      data(html, 'panelsReady', String(showPanels));
      data(html, 'selectedReady', String(showPanels && Boolean(selected)));
      const bounds = panels.map((p) => ({
        id: p.project.id,
        visible: p.mesh.visible && p.front.opacity > 0.1,
        ...projectedPanel(p.mesh, camera, width, height),
      }));
      if (diagnosticsDue) data(root, 'panelBounds', JSON.stringify(bounds));
      // A sliver at the viewport edge must not keep the carousel or videos alive.
      const visibleBounds = bounds.filter((p) => {
        const area = Math.max(1, (p.right - p.left) * (p.bottom - p.top));
        const visibleArea =
          Math.max(0, Math.min(width, p.right) - Math.max(0, p.left)) *
          Math.max(0, Math.min(height, p.bottom) - Math.max(0, p.top));
        return p.visible && visibleArea / area >= 0.25;
      });
      onVisibility(visibleBounds.map((p) => p.id));
      visibleProjects = new Set(visibleBounds.map((p) => p.id));
      if (diagnosticsDue) {
        lastDiagnostics = now;
        data(root, 'gpuResources', JSON.stringify(renderer.info.memory));
        data(
          root,
          'panelFocus',
          JSON.stringify(
            panels.map((p) => ({
              id: p.project.id,
              blur: p.surface.blur.value,
              emphasis: p.emphasis,
            })),
          ),
        );
      }
      if (orbitMoving && visibleBounds.length > 0) invalidate();
      if (
        panels.some(
          (panel) => panel.animation && animationWanted(panel.project.id),
        )
      )
        invalidate();
    } catch {
      controller.setState({ kind: 'fallback', reason: 'load-error' });
      return;
    }
    if (
      progress !== destination ||
      panelProgress !== destination ||
      selectionMix !== (selected ? 1 : 0) ||
      highlighting ||
      attentionMix !== (activeId ? 1 : 0)
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
    layoutDirty = true;
    const newWidth = Math.max(1, nextWidth);
    const newHeight = Math.max(1, nextHeight);
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      sceneConfig.quality.maxPixelRatio,
      Math.sqrt(sceneConfig.quality.maxRenderPixels / (newWidth * newHeight)),
    );
    if (
      width !== newWidth ||
      height !== newHeight ||
      renderer.getPixelRatio() !== ratio
    ) {
      width = newWidth;
      height = newHeight;
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      effects.resize(width, height, ratio);
    }
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
      previewHovered = false;
      stopAnimations();
      if (selected) focusId = selected;
      const parent = selected ? previewScene : root;
      if (renderer.domElement.parentElement !== parent)
        parent.append(renderer.domElement);
      delete html.dataset['selectedReady'];
      resize();
    },
    setActive(id) {
      activeId = id;
      orbit.focus(
        id ? projects.findIndex((project) => project.id === id) : undefined,
      );
      root.dataset['activeProject'] = id ?? '';
      invalidate();
    },
    setMotion(enabled) {
      if (enabled === motionEnabled || disposed) return;
      motionEnabled = enabled;
      if (!enabled) stopAnimations();
      invalidate();
    },
    setMedia(id, video) {
      if (disposed) return;
      const panel = panels.find((p) => p.project.id === id);
      if (!panel || panel.animation) return;
      panel.element = video ?? undefined;
      if (video && !panel.video) {
        panel.video = new THREE.VideoTexture(video);
        panel.video.colorSpace = THREE.SRGBColorSpace;
        panel.video.generateMipmaps = true;
        panel.video.minFilter = THREE.LinearMipmapLinearFilter;
        textures.push(panel.video);
      }
      const nextMap =
        video && panel.video ? panel.video : (panel.poster ?? null);
      if (panel.front.map !== nextMap) {
        panel.front.map = nextMap;
        panel.front.needsUpdate = true;
      }
      invalidate();
    },
    invalidate,
    resize,
    pause() {
      paused = true;
      stopAnimations();
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
      panels.forEach((panel) => panel.animation?.dispose());
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
  function scroll() {
    layoutDirty = true;
    invalidate();
  }
  window.addEventListener('scroll', scroll, {
    passive: true,
    signal: events.signal,
  });
  dialog.addEventListener('scroll', scroll, {
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
      if (panel.animation && 'ready' in panel.animation) {
        const ready = await panel.animation.ready;
        if (disposed) return;
        if (ready && panel.animationTexture) {
          panel.animationTexture.needsUpdate = true;
          panel.front.map = panel.animationTexture;
        } else {
          panel.front.map = texture;
        }
        panel.front.needsUpdate = true;
      } else if (!panel.element && !panel.animationTexture) {
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
