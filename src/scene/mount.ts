import type { SceneController, SceneProject } from './types';
import { createMediaManager } from './media';
import { createSelection } from './selection';

export function mountPortfolioScene() {
  const root = document.querySelector<HTMLElement>('[data-scene-root]');
  if (!root || root.dataset['mounted']) return;
  root.dataset['mounted'] = 'true';
  const projects = JSON.parse(
    root.dataset['projects'] ?? '[]',
  ) as SceneProject[];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let controller: SceneController | undefined;
  let generation = 0;
  let active = true;
  let media: ReturnType<typeof createMediaManager> | undefined;
  let selection: ReturnType<typeof createSelection> | undefined;
  function stopScene() {
    generation++;
    controller?.dispose();
    controller = undefined;
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
      controller = createPortfolioScene(root!, projects);
      if (selection?.selected)
        controller.setState({
          kind: 'selected',
          projectId: selection.selected.id,
        });
      media?.attach();
    } catch {
      root!.dataset['state'] = 'fallback';
      root!.dataset['fallbackReason'] = 'unsupported';
    }
  }
  function mount() {
    media = createMediaManager(
      (id, video) => controller?.setMedia(id, video),
      () => controller?.invalidate(),
    );
    selection = createSelection(projects, (project) => {
      media?.select(project?.id);
      controller?.setState(
        project
          ? { kind: 'selected', projectId: project.id }
          : { kind: 'overview' },
      );
    });
    selection.syncHistory();
    void startScene();
  }
  motion.addEventListener('change', () => {
    void startScene();
  });
  window.addEventListener('pagehide', () => {
    active = false;
    stopScene();
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
