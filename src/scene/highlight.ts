export function createHighlight(
  section: HTMLElement,
  onChange: (id: string | undefined) => void,
) {
  const list = section.querySelector<HTMLElement>('[data-project-rows]');
  const rows = [...section.querySelectorAll<HTMLElement>('[data-project-id]')];
  const events = new AbortController();
  let pointer: string | undefined,
    focus: string | undefined,
    active: string | undefined;
  const idFor = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLElement>('[data-project-id]')?.dataset['projectId']
      : undefined;
  function update() {
    const next = focus ?? pointer;
    if (next === active) return;
    active = next;
    rows.forEach(
      (row) =>
        (row.dataset['active'] = String(row.dataset['projectId'] === active)),
    );
    onChange(active);
  }
  list?.addEventListener(
    'pointerover',
    (event) => {
      if (event.pointerType === 'touch') return;
      pointer = idFor(event.target);
      update();
    },
    { signal: events.signal },
  );
  list?.addEventListener(
    'pointerleave',
    () => {
      pointer = undefined;
      update();
    },
    { signal: events.signal },
  );
  list?.addEventListener(
    'pointermove',
    (event) => {
      const rect = list.getBoundingClientRect();
      list.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      list.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    },
    { passive: true, signal: events.signal },
  );
  list?.addEventListener(
    'focusin',
    (event) => {
      focus = idFor(event.target);
      update();
    },
    { signal: events.signal },
  );
  list?.addEventListener(
    'focusout',
    (event) => {
      focus = idFor(event.relatedTarget);
      update();
    },
    { signal: events.signal },
  );
  return {
    get active() {
      return active;
    },
    dispose() {
      events.abort();
      rows.forEach((row) => delete row.dataset['active']);
    },
  };
}
