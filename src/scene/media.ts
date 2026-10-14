import { sceneConfig } from './config';

type Connection = EventTarget & { saveData?: boolean };
interface MediaEntry {
  id: string;
  video: HTMLVideoElement;
  home: HTMLElement;
  visible: boolean;
  wanted: boolean;
  pending: boolean;
  failed: boolean;
  ticket: number;
  callback: number;
  fallbackFrame: number;
}

export function createMediaManager(
  onChange: (id: string, video: HTMLVideoElement | null) => void,
  onFrame: () => void,
) {
  const entries: MediaEntry[] = [
    ...document.querySelectorAll<HTMLVideoElement>('[data-project-video]'),
  ].map((video) => ({
    id: video.dataset['projectVideo']!,
    video,
    home: video.parentElement!,
    visible: false,
    wanted: false,
    pending: false,
    failed: false,
    ticket: 0,
    callback: 0,
    fallbackFrame: 0,
  }));
  const events = new AbortController();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 1099px), (max-height: 799px)');
  const safari =
    /Safari/.test(navigator.userAgent) &&
    !/Chrome|Chromium|CriOS|Edg|Android/.test(navigator.userAgent);
  const mobile =
    /Android|iPhone|iPad|iPod|Mobile/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  const connection = (navigator as Navigator & { connection?: Connection })
    .connection;
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]'),
  ];
  const status = document.querySelector<HTMLElement>('[data-media-status]')!;
  const preview = document.querySelector<HTMLElement>('[data-preview-panel]')!;
  let selected: string | undefined;
  let previewVisible = false;
  let userPaused = false;
  let disposed = false;
  let autoplayBlocked = false;

  function cancelFrames(entry: MediaEntry) {
    if (entry.callback) entry.video.cancelVideoFrameCallback(entry.callback);
    cancelAnimationFrame(entry.fallbackFrame);
    entry.callback = entry.fallbackFrame = 0;
  }
  function frame(entry: MediaEntry) {
    if (disposed || !entry.wanted || entry.video.paused) return;
    if ('requestVideoFrameCallback' in entry.video) {
      entry.callback = entry.video.requestVideoFrameCallback(() => {
        entry.callback = 0;
        if (!entry.wanted || disposed) return;
        onFrame();
        frame(entry);
      });
    } else {
      entry.fallbackFrame = requestAnimationFrame(() => {
        entry.fallbackFrame = 0;
        onFrame();
        frame(entry);
      });
    }
  }
  function pause(entry: MediaEntry) {
    entry.wanted = false;
    entry.ticket++;
    entry.video.pause();
    entry.video.dataset['playing'] = 'false';
    cancelFrames(entry);
    onChange(entry.id, null);
  }
  function play(entry: MediaEntry) {
    entry.wanted = true;
    if (entry.pending || !entry.video.paused || entry.failed) return;
    entry.video.muted = true;
    entry.video.playsInline = true;
    if (!entry.video.getAttribute('src'))
      entry.video.src = entry.video.dataset['src']!;
    const ticket = ++entry.ticket;
    entry.pending = true;
    void entry.video
      .play()
      .then(() => {
        if (disposed || !entry.wanted) {
          entry.video.pause();
          return;
        }
      })
      .catch((error: unknown) => {
        if (disposed || ticket !== entry.ticket || !entry.wanted) return;
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          autoplayBlocked = true;
          userPaused = true;
        } else if (!(
          error instanceof DOMException && error.name === 'AbortError'
        )) {
          entry.failed = true;
        }
      })
      .finally(() => {
        entry.pending = false;
        if (!disposed) update();
      });
  }
  function update() {
    if (disposed) return;
    const stopped =
      userPaused || reduce.matches || connection?.saveData || document.hidden;
    const limit =
      compact.matches || safari || mobile
        ? sceneConfig.media.constrainedPlayingLimit
        : sceneConfig.media.desktopPlayingLimit;
    const eligible = entries.filter(
      (entry) =>
        !entry.failed &&
        (selected ? entry.id === selected && previewVisible : entry.visible),
    );
    const desired = new Set(
      stopped ? [] : eligible.slice(0, limit).map((entry) => entry.id),
    );
    // Stop first so an asynchronous start can never exceed the playback budget.
    entries
      .filter(
        (entry) =>
          !desired.has(entry.id) && (entry.wanted || !entry.video.paused),
      )
      .forEach(pause);
    entries.filter((entry) => desired.has(entry.id)).forEach(play);
    for (const button of buttons) {
      button.hidden =
        entries.length === 0 ||
        reduce.matches ||
        Boolean(connection?.saveData) ||
        (Boolean(button.closest('dialog')) &&
          !entries.some((entry) => entry.id === selected));
      button.textContent = userPaused ? 'Play previews' : 'Pause previews';
      button.setAttribute('aria-pressed', String(!userPaused));
    }
    const item = entries.find((entry) => entry.id === selected);
    status.textContent = item?.failed
      ? 'Motion preview unavailable. The still illustration is shown.'
      : autoplayBlocked && item
        ? 'Playback is paused. Choose Play previews to start it.'
        : reduce.matches && item
          ? 'Still preview follows your reduced-motion preference.'
          : connection?.saveData && item
            ? 'Still preview follows your data-saving preference.'
            : '';
  }
  const observer = new IntersectionObserver(
    (changes) => {
      for (const change of changes) {
        if (change.target === preview)
          previewVisible =
            change.isIntersecting && change.intersectionRatio >= 0.2;
        const entry = entries.find((item) => item.home === change.target);
        if (entry)
          entry.visible =
            change.isIntersecting && change.intersectionRatio >= 0.2;
      }
      update();
    },
    { threshold: [0, 0.2] },
  );
  observer.observe(preview);
  for (const entry of entries) {
    observer.observe(entry.home);
    entry.video.addEventListener(
      'playing',
      () => {
        if (!entry.wanted || disposed) {
          entry.video.pause();
          return;
        }
        entry.video.dataset['playing'] = 'true';
        onChange(entry.id, entry.video);
        cancelFrames(entry);
        frame(entry);
      },
      { signal: events.signal },
    );
    entry.video.addEventListener(
      'error',
      () => {
        entry.failed = true;
        pause(entry);
        update();
      },
      { signal: events.signal },
    );
    // Reparenting or browser suspension can pause a video outside our scheduler.
    entry.video.addEventListener(
      'pause',
      () => {
        cancelFrames(entry);
        entry.video.dataset['playing'] = 'false';
        onChange(entry.id, null);
        if (entry.wanted && !disposed) update();
      },
      { signal: events.signal },
    );
  }
  for (const button of buttons)
    button.addEventListener(
      'click',
      () => {
        userPaused = !userPaused;
        autoplayBlocked = false;
        update();
      },
      { signal: events.signal },
    );
  document.addEventListener('visibilitychange', update, {
    signal: events.signal,
  });
  compact.addEventListener('change', update, { signal: events.signal });
  reduce.addEventListener('change', update, { signal: events.signal });
  connection?.addEventListener('change', update, { signal: events.signal });
  update();
  return {
    select(id: string | undefined) {
      entries.forEach(pause);
      selected = id;
      for (const entry of entries) {
        const parent = entry.id === id ? preview : entry.home;
        if (entry.video.parentElement !== parent) parent.append(entry.video);
      }
      update();
    },
    attach() {
      for (const entry of entries)
        onChange(
          entry.id,
          entry.video.dataset['playing'] === 'true' ? entry.video : null,
        );
    },
    dispose() {
      disposed = true;
      events.abort();
      observer.disconnect();
      for (const entry of entries) {
        pause(entry);
        entry.home.append(entry.video);
        entry.video.removeAttribute('src');
        entry.video.load();
      }
      buttons.forEach((button) => {
        button.hidden = true;
      });
    },
  };
}
