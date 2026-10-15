import type { SceneController, SceneProject, SceneElements } from './types';
import { createMediaManager } from './media';
import { createSelection } from './selection';
import { createHighlight } from './highlight';

export function mountPortfolioScene() {
  const root = document.querySelector<HTMLElement>('[data-scene-root]');
  const section = document.querySelector<HTMLElement>('[data-gallery]');
  const dialog = document.querySelector<HTMLDialogElement>('#project-preview');
  const preview = dialog?.querySelector<HTMLElement>('[data-preview-panel]');
  const previewScene = dialog?.querySelector<HTMLElement>(
    '[data-preview-scene]',
  );
  if (
    !root ||
    !section ||
    !dialog ||
    !preview ||
    !previewScene ||
    root.dataset['mounted']
  )
    return;
  root.dataset['mounted'] = 'true';
  const elements: SceneElements = {
    root,
    section,
    dialog,
    preview,
    previewScene,
    hero: document.querySelector<HTMLElement>('[data-hero]') ?? undefined,
    mode: root.dataset['mode'] === 'index' ? 'index' : 'home',
  };
  const projects = JSON.parse(
    root.dataset['projects'] ?? '[]',
  ) as SceneProject[];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let controller: SceneController | undefined,
    generation = 0,
    active = true;
  let media: ReturnType<typeof createMediaManager> | undefined;
  let selection: ReturnType<typeof createSelection> | undefined;
  let highlight: ReturnType<typeof createHighlight> | undefined;
  function stopScene() {
    generation++;
    controller?.dispose();
    controller = undefined;
    media?.setSceneAvailable(false);
  }
  async function startScene() {
    stopScene();
    if (!active || motion.matches) {
      root!.dataset['state'] = 'fallback';
      root!.dataset['fallbackReason'] = 'reduced-motion';
      return;
    }
    const ticket = generation;
    try {
      const { createPortfolioScene } = await import('./renderer');
      if (ticket !== generation || !active) return;
      delete root!.dataset['fallbackReason'];
      controller = createPortfolioScene(elements, projects, (ids) =>
        media?.setVisibleProjects(ids),
      );
      if (selection?.selected)
        controller.setState({
          kind: 'selected',
          projectId: selection.selected.id,
        });
      controller.setActive(highlight?.active);
      media?.attach();
    } catch {
      root!.dataset['state'] = 'fallback';
      root!.dataset['fallbackReason'] = 'unsupported';
    }
  }
  function theme() {
    const rect = section!.getBoundingClientRect();
    document.body.dataset['worksActive'] = String(
      elements.mode === 'index' || (rect.top < 80 && rect.bottom > 80),
    );
  }
  const stateObserver = new MutationObserver(() =>
    media?.setSceneAvailable(root!.dataset['state'] !== 'fallback'),
  );
  function mount() {
    media = createMediaManager(
      elements,
      (id, video) => controller?.setMedia(id, video),
      () => controller?.invalidate(),
      (enabled) => controller?.setMotion(enabled),
      projects
        .filter((project) => project.animation)
        .map((project) => project.id),
    );
    highlight = createHighlight(section!, (id) => {
      controller?.setActive(id);
      media?.prioritize(id);
    });
    selection = createSelection(dialog!, section!, projects, (project) => {
      media?.select(project?.id);
      controller?.setState(
        project
          ? { kind: 'selected', projectId: project.id }
          : { kind: 'overview' },
      );
    });
    stateObserver.observe(root!, {
      attributes: true,
      attributeFilter: ['data-state'],
    });
    selection.syncHistory();
    theme();
    void startScene();
  }
  motion.addEventListener('change', () => void startScene());
  window.addEventListener('scroll', theme, { passive: true });
  window.addEventListener('pagehide', () => {
    active = false;
    stateObserver.disconnect();
    stopScene();
    highlight?.dispose();
    highlight = undefined;
    media?.dispose();
    media = undefined;
    selection?.dispose();
    selection = undefined;
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      active = true;
      mount();
    }
  });
  mount();
}
