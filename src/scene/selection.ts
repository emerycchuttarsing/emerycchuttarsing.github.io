import type { SceneProject } from './types';

const historyKey = 'portfolioPreview';

export function createSelection(
  dialog: HTMLDialogElement,
  section: HTMLElement,
  projects: SceneProject[],
  onChange: (project: SceneProject | undefined) => void,
) {
  const triggers = [...section.querySelectorAll<HTMLElement>('[data-preview]')];
  const list = section.querySelector<HTMLElement>('[data-project-rows]');
  const events = new AbortController();
  let selected: SceneProject | undefined;
  let trigger: HTMLElement | undefined;
  const title = dialog.querySelector<HTMLElement>('#preview-title')!;
  const summary = dialog.querySelector<HTMLElement>('#preview-summary')!;
  const image = dialog.querySelector<HTMLImageElement>(
    '[data-preview-poster]',
  )!;
  const link = dialog.querySelector<HTMLAnchorElement>('[data-preview-study]')!;
  function show(project: SceneProject, source?: HTMLElement) {
    selected = project;
    trigger =
      source ??
      triggers.find((element) => element.dataset['preview'] === project.id);
    title.textContent = project.title;
    summary.textContent = project.summary;
    image.src = project.poster.src;
    image.alt = project.poster.alt;
    link.href = project.href;
    dialog.querySelector('[data-preview-number]')!.textContent =
      `${String(projects.indexOf(project) + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    dialog.querySelector('[data-preview-category]')!.textContent =
      project.featured ? 'Featured research' : 'Further exploration';
    dialog.querySelector('[data-preview-caption]')!.textContent =
      project.animation === 'bitcoin-price'
        ? 'Simulated Bitcoin price path · No market data.'
        : project.animation === 'hedge-rebalancing'
          ? 'Illustrative hedge rebalancing · Not model output.'
          : project.animation === 'music-sorting'
            ? 'Illustrative playlist matching · Black notes selected, grey notes set aside.'
            : project.animation === 'embedding-space'
              ? 'Illustrative embedding space · Positions are not trained model coordinates.'
              : project.animation === 'link-signal'
                ? 'Illustrative signal flow · Orange: active edge; red: recently visited.'
                : project.animation === 'vision-features'
                  ? 'Four regions of a project satellite image · Original, Sobel edges and LBP texture.'
                  : project.animation === 'retail-demand'
                    ? 'Illustrative demand planning for AKO · Animated values are not model forecasts.'
                    : project.video
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
  for (const control of triggers) {
    control.hidden = false;
    // Keep the case-study href as a no-JS fallback; with JS the title is a
    // dialog trigger, including Space activation and focus restoration.
    if (control instanceof HTMLAnchorElement) {
      control.setAttribute('role', 'button');
      control.setAttribute('aria-haspopup', 'dialog');
      control.setAttribute('aria-controls', dialog.id);
      control.addEventListener(
        'keydown',
        (event) => {
          if (event.key !== ' ') return;
          event.preventDefault();
          control.click();
        },
        { signal: events.signal },
      );
    }
  }
  if (list) list.dataset['previewReady'] = 'true';
  list?.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Element)) return;
      const row = event.target.closest<HTMLElement>('[data-project-id]');
      const project = projects.find(
        (item) => item.id === row?.dataset['projectId'],
      );
      if (!row || !project) return;
      event.preventDefault();
      const source =
        event.target.closest<HTMLElement>('[data-preview]') ??
        row.querySelector<HTMLElement>('.row-title') ??
        undefined;
      history.pushState({ ...history.state, [historyKey]: project.id }, '');
      show(project, source);
    },
    { signal: events.signal },
  );
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
      if (list) delete list.dataset['previewReady'];
      triggers.forEach((control) => {
        if (control instanceof HTMLButtonElement) control.hidden = true;
        else {
          control.removeAttribute('role');
          control.removeAttribute('aria-haspopup');
          control.removeAttribute('aria-controls');
        }
      });
    },
  };
}
