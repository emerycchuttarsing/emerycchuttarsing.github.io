import type { SceneController, SceneProject } from './types';

export function mountPortfolioScene() {
  const root = document.querySelector<HTMLElement>('[data-scene-root]');
  if (!root || root.dataset['mounted']) return;
  root.dataset['mounted'] = 'true';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let controller: SceneController | undefined;
  let generation = 0;
  let active = true;
  function stop() {
    generation++;
    controller?.dispose();
    controller = undefined;
  }
  async function start() {
    stop();
    if (!active || motion.matches) {
      root!.dataset['state'] = 'fallback';
      return;
    }
    const ticket = generation;
    try {
      const projects = JSON.parse(
        root!.dataset['projects'] ?? '[]',
      ) as SceneProject[];
      const { createPortfolioScene } = await import('./renderer');
      if (ticket !== generation || !active) return;
      controller = createPortfolioScene(root!, projects);
    } catch {
      root!.dataset['state'] = 'fallback';
    }
  }
  motion.addEventListener('change', () => {
    void start();
  });
  window.addEventListener('pagehide', () => {
    active = false;
    stop();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      active = true;
      void start();
    }
  });
  void start();
}
