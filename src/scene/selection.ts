import type { SceneProject } from './types';

const historyKey = 'portfolioPreview';

export function createSelection(
  projects: SceneProject[],
  onChange: (project: SceneProject | undefined) => void,
) {
  const dialog = document.querySelector<HTMLDialogElement>('#project-preview')!;
  const triggers = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-preview]'),
  ];
  const events = new AbortController();
  let selected: SceneProject | undefined;
  let trigger: HTMLElement | undefined;
  const title = dialog.querySelector<HTMLElement>('#preview-title')!;
  const summary = dialog.querySelector<HTMLElement>('#preview-summary')!;
  const image = dialog.querySelector<HTMLImageElement>(
    '[data-preview-poster]',
  )!;
  const link = dialog.querySelector<HTMLAnchorElement>('[data-preview-study]')!;
  function show(project: SceneProject) {
    selected = project;
    trigger = triggers.find(
      (element) => element.dataset['preview'] === project.id,
    );
    title.textContent = project.title;
    summary.textContent = project.summary;
    image.src = project.poster.src;
    image.alt = project.poster.alt;
    link.href = project.href;
    dialog.querySelector('[data-preview-number]')!.textContent =
      `${String(projects.indexOf(project) + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    dialog.querySelector('[data-preview-category]')!.textContent =
      project.featured ? 'Featured research' : 'Further exploration';
    dialog.querySelector('[data-preview-caption]')!.textContent = project.video
      ? 'Conceptual motion study · No experimental results.'
      : 'Conceptual illustration · No experimental results.';
    document.documentElement.classList.add('preview-open');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    onChange(project);
  }
  function hide(restoreFocus = true) {
    selected = undefined;
    if (dialog.open) dialog.close();
    document.documentElement.classList.remove('preview-open');
    onChange(undefined);
    if (restoreFocus) trigger?.focus({ preventScroll: true });
  }
  function close() {
    if (!selected) return;
    hide();
    if (history.state?.[historyKey]) history.back();
  }
  function syncHistory() {
    const project = projects.find(
      (item) => item.id === history.state?.[historyKey],
    );
    if (project) show(project);
    else if (selected) hide();
  }
  for (const button of triggers) {
    button.hidden = false;
    button.addEventListener(
      'click',
      () => {
        const project = projects.find(
          (item) => item.id === button.dataset['preview'],
        );
        if (!project) return;
        history.pushState({ ...history.state, [historyKey]: project.id }, '');
        show(project);
      },
      { signal: events.signal },
    );
  }
  dialog
    .querySelector('[data-preview-close]')!
    .addEventListener('click', close, { signal: events.signal });
  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      close();
    },
    { signal: events.signal },
  );
  dialog.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Tab') return;
      const controls = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([hidden]), a[href]',
        ),
      ].filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    { signal: events.signal },
  );
  // A native dialog contains focus. Browser Back/Forward mirrors the preview state.
  window.addEventListener('popstate', syncHistory, { signal: events.signal });
  return {
    syncHistory,
    get selected() {
      return selected;
    },
    dispose() {
      events.abort();
      hide(false);
      triggers.forEach((button) => {
        button.hidden = true;
      });
    },
  };
}
