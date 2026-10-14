const { chromium } = await import(
  process.env['PLAYWRIGHT_MODULE'] ?? 'playwright'
);
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env['PORTFOLIO_BASE_URL'] ?? 'http://127.0.0.1:4321';
const out =
  process.env['PORTFOLIO_SCREENSHOTS'] ?? 'test-results/mirage-correction';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = {
  checkedAt: new Date().toISOString(),
  browser: browser.version(),
  layouts: [],
  scenarios: [],
  errors: [],
};
const ids = [
  'rl-path-signatures',
  'signature-deep-hedging',
  'music-recommendation',
  'tinystories-transformer',
  'link-prediction',
  'visual-learning',
  'retail-forecasting',
];
async function make(options = {}, setup) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...options,
  });
  await context.addInitScript(() => {
    window.__rafRequests = 0;
    const original = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      window.__rafRequests++;
      return original(callback);
    };
    window.__maxPlaying = 0;
    setInterval(() => {
      window.__maxPlaying = Math.max(
        window.__maxPlaying,
        [...document.querySelectorAll('video')].filter((v) => !v.paused).length,
      );
    }, 10);
  });
  if (setup) await context.addInitScript(setup);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.setDefaultNavigationTimeout(12000);
  page.on('pageerror', (error) => report.errors.push(error.message));
  return { context, page };
}
async function home(page) {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('[data-preview]').first().waitFor({ state: 'visible' });
}
async function gallery(page, rendered = true) {
  await page.evaluate(() =>
    scrollTo(0, document.querySelector('#projects').offsetTop),
  );
  if (rendered)
    await page.waitForFunction(
      () =>
        document.querySelector('[data-scene-root]').dataset.progress ===
        '1.000',
    );
}
async function countPlaying(page) {
  return page
    .locator('video')
    .evaluateAll((es) => es.filter((e) => !e.paused).length);
}
async function waitPlaying(page, n) {
  await page.waitForFunction(
    (n) =>
      [...document.querySelectorAll('video')].filter(
        (v) => !v.paused && v.dataset.playing === 'true',
      ).length === n,
    n,
  );
}
async function select(page, id) {
  await page.locator(`[data-preview="${id}"]`).click();
  await page.waitForFunction(() => document.querySelector('dialog').open);
  assert.equal(
    await page.locator('[data-preview-study]').getAttribute('href'),
    `/projects/${id}/`,
  );
}
async function close(page, key = false) {
  if (key) await page.keyboard.press('Escape');
  else await page.locator('[data-preview-close]').click();
  await page.waitForFunction(
    () =>
      !document.querySelector('dialog').open &&
      !history.state?.portfolioPreview,
  );
}
async function idle(page) {
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => window.__rafRequests);
  await page.waitForTimeout(450);
  assert.equal(
    await page.evaluate(() => window.__rafRequests),
    before,
    'no render loop at rest',
  );
}
try {
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
  ]) {
    const { context, page } = await make({ viewport: { width, height } });
    await home(page);
    assert.equal(
      await page.locator('video[src]').count(),
      0,
      'no video download in hero',
    );
    await page.waitForFunction(
      () => document.documentElement.dataset.terrainReady === 'true',
    );
    await page.screenshot({ path: `${out}/hero-${width}x${height}.png` });
    await page.evaluate(() =>
      scrollTo(
        0,
        document.querySelector('#projects').offsetTop - innerHeight * 0.45,
      ),
    );
    await page.waitForFunction(
      () =>
        Math.abs(
          Number(document.querySelector('[data-scene-root]').dataset.progress) -
            0.5,
        ) < 0.015,
    );
    assert.equal(
      await page.locator('[data-scene-root]').getAttribute('data-state'),
      'reveal',
    );
    if (width === 1440)
      await page.screenshot({ path: `${out}/reveal-1440x900.png` });
    await gallery(page);
    assert.equal(await page.locator('.project-row').count(), 7);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    const panels = await page.locator('.project-row').evaluateAll((es) =>
      es.map((e) => ({
        top: e.getBoundingClientRect().top,
        bottom: e.getBoundingClientRect().bottom,
      })),
    );
    if (width === 1440)
      assert(panels.every((r) => r.top >= 0 && r.bottom <= height));
    if (width >= 1100) await waitPlaying(page, 2);
    assert((await countPlaying(page)) <= (width >= 1100 ? 2 : 1));
    await page.screenshot({ path: `${out}/gallery-${width}x${height}.png` });
    await select(page, 'music-recommendation');
    const scrollBeforeClose = await page.evaluate(() => scrollY);
    await waitPlaying(page, 1);
    await page.waitForFunction(
      () =>
        document.querySelector('[data-project-video="music-recommendation"]')
          .dataset.playing === 'true',
    );
    const time = await page
      .locator('[data-project-video="music-recommendation"]')
      .evaluate((v) => v.currentTime);
    await page.waitForTimeout(1200);
    assert(
      (await page
        .locator('[data-project-video="music-recommendation"]')
        .evaluate((v) => v.currentTime)) > time,
      'video progresses',
    );
    assert.equal(
      await page.evaluate(
        () => document.querySelector('dialog').scrollWidth > innerWidth,
      ),
      false,
    );
    assert.equal(
      await page.locator('canvas').count(),
      1,
      'same single canvas in preview',
    );
    await page.screenshot({ path: `${out}/selected-${width}x${height}.png` });
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      assert(
        await page
          .locator(':focus')
          .evaluate((e) => Boolean(e.closest('dialog'))),
        'focus stays in dialog',
      );
    }
    await close(page, true);
    assert(
      Math.abs((await page.evaluate(() => scrollY)) - scrollBeforeClose) < 2,
      'selection preserves gallery scroll',
    );
    assert.equal(
      await page.locator(':focus').getAttribute('data-preview'),
      'music-recommendation',
    );
    assert.equal(await page.locator('[data-scene-root] canvas').count(), 1);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(
      () =>
        document.querySelector('[data-scene-root]').dataset.progress ===
        '0.000',
    );
    console.log(`Layout and preview passed: ${width} × ${height}`);
    report.layouts.push({
      width,
      height,
      sevenProjects: true,
      maxPlaying: await page.evaluate(() => window.__maxPlaying),
      modal: true,
      panels,
    });
    assert(
      (await page.evaluate(() => window.__maxPlaying)) <=
        (width >= 1100 ? 2 : 1),
    );
    await context.close();
  }

  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
  ]) {
    const { context, page } = await make({ viewport: { width, height } });
    await page.goto(base + '/projects/', { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => document.documentElement.dataset.panelsReady === 'true',
    );
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.project-row').count(), 7);
    assert.equal(await page.locator('.row-featured span').count(), 3);
    assert.equal(await page.locator('canvas').count(), 1);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    const projected = await page
      .locator('[data-scene-root]')
      .evaluate((e) => JSON.parse(e.dataset.panelBounds));
    const rows = await page.locator('.project-row').evaluateAll((es) =>
      es.map((e) => {
        const r = e.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom };
      }),
    );
    if (width >= 1280) {
      assert(
        rows.every((r) => r.top >= 0 && r.bottom <= height),
        'seven rows visible',
      );
      for (const panel of projected) {
        assert(
          panel.visible &&
            panel.left >= 0 &&
            panel.right <= width &&
            panel.top >= 0 &&
            panel.bottom <= height,
          'panel in viewport',
        );
        assert(panel.right - panel.left >= 90, 'panel wider than 90px');
        // Orbital staging deliberately overlaps the back row. Every project
        // remains reachable in HTML and moves forward on hover/focus.
      }
    }
    await page.screenshot({
      path: `${out}/index-${width}x${height}.png`,
      fullPage: width === 390,
    });
    const first = page.locator('.row-title').first();
    await first.focus();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-scene-root]').dataset.activeProject ===
        'rl-path-signatures',
    );
    const historyLength = await page.evaluate(() => history.length);
    await page.locator('.project-row').nth(4).hover();
    assert.equal(
      await page
        .locator('[data-scene-root]')
        .getAttribute('data-active-project'),
      ids[0],
      'focus wins over hover',
    );
    await page.locator('h1').click();
    await page.locator('.project-row').nth(4).hover();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-scene-root]').dataset.activeProject ===
        'link-prediction',
    );
    assert.equal(await page.evaluate(() => history.length), historyLength);
    assert.equal(
      await page.locator('dialog').evaluate((e) => e.open),
      false,
      'hover does not select',
    );
    if (width === 1440) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/active-secondary.png` });
      await page.locator('.project-row').nth(2).hover();
      await page.waitForFunction(
        () =>
          document.querySelector('[data-project-video="music-recommendation"]')
            .dataset.playing === 'true',
      );
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/active-featured.png` });
      const performanceSample = page.evaluate(
        () =>
          new Promise((resolve) => {
            const times = [];
            const start = performance.now();
            function sample(t) {
              times.push(t);
              if (t - start < 2400) requestAnimationFrame(sample);
              else resolve(times.slice(1).map((v, i) => v - times[i]));
            }
            requestAnimationFrame(sample);
          }),
      );
      for (let i = 0; i < 10; i++) {
        await page
          .locator('.project-row')
          .nth(i % 7)
          .hover();
        await page.waitForTimeout(150);
      }
      const deltas = await performanceSample;
      deltas.sort((a, b) => a - b);
      report.fluidity = {
        method:
          'browser rAF intervals during ten highlight transitions; videos are 24fps',
        samples: deltas.length,
        meanFps: 1000 / (deltas.reduce((a, b) => a + b, 0) / deltas.length),
        medianMs: deltas[Math.floor(deltas.length * 0.5)],
        p95Ms: deltas[Math.floor(deltas.length * 0.95)],
        gpu: await page.locator('canvas').evaluate((c) => {
          const gl = c.getContext('webgl2'),
            ext = gl.getExtension('WEBGL_debug_renderer_info');
          return ext
            ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
            : 'not exposed';
        }),
      };
      const memory = [];
      for (let round = 0; round < 3; round++) {
        for (const id of ids.slice(0, 3)) {
          await select(page, id);
          await page.waitForTimeout(130);
          await close(page);
        }
        await page.waitForTimeout(900);
        memory.push(
          await page
            .locator('[data-scene-root]')
            .evaluate((e) => JSON.parse(e.dataset.gpuResources)),
        );
      }
      assert.deepEqual(
        memory[2],
        memory[1],
        'GPU resources stable after warmup',
      );
      report.gpuMemory = memory;
      for (const id of ids) {
        await page.locator(`[data-project-id="${id}"] .row-title`).click();
        await page.waitForURL(`**/projects/${id}/`);
        assert.equal(await page.locator('canvas').count(), 0);
        await page.goBack({ waitUntil: 'networkidle' });
        await page.waitForFunction(
          () => document.querySelectorAll('canvas').length === 1,
        );
      }
      await select(page, ids[0]);
      await page.goBack();
      await page.waitForFunction(() => !document.querySelector('dialog').open);
      await page.goForward();
      await page.waitForFunction(() => document.querySelector('dialog').open);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('dialog').open);
      await close(page);
    }
    report.layouts.push({
      route: '/projects/',
      width,
      height,
      rows,
      projected,
    });
    console.log(`Works index passed: ${width} × ${height}`);
    await context.close();
  }
  report.scenarios.push(
    'index direct load / four viewports',
    'seven orbital panels framed with seven native project links',
    'focus priority over hover',
    'hover leaves history and dialog unchanged',
    'active video priority',
    'index study links and native history',
    'GPU resource stability',
  );

  const { context, page } = await make();
  await home(page);
  await gallery(page);
  await page.locator('[data-preview]').first().press('Enter');
  await page.waitForFunction(() => document.querySelector('dialog').open);
  await close(page, true);
  report.scenarios.push('keyboard preview activation');
  for (const id of ids) {
    await select(page, id);
    await close(page);
  }
  await select(page, ids[0]);
  await page.setViewportSize({ width: 390, height: 420 });
  await page.locator('dialog').evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  await waitPlaying(page, 0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('dialog').evaluate((e) => {
    e.scrollTop = 0;
  });
  await waitPlaying(page, 1);
  report.scenarios.push('preview media pauses outside dialog viewport');
  await page.goBack();
  await page.waitForFunction(() => !document.querySelector('dialog').open);
  await page.goForward();
  await page.waitForFunction(() => document.querySelector('dialog').open);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('dialog').open);
  await page.locator('[data-preview-study]').click();
  await page.waitForURL(`**/projects/${ids[0]}/`);
  assert.equal(await page.locator('canvas').count(), 0);
  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForFunction(
    () =>
      document.querySelector('dialog').open &&
      document.querySelectorAll('canvas').length === 1,
  );
  await close(page);
  await page.locator(`[data-project-id="${ids[6]}"] .row-title`).click();
  await page.waitForURL(`**/projects/${ids[6]}/`);
  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => document.querySelectorAll('canvas').length === 1,
  );
  await gallery(page);
  await page.locator('[data-gallery] [data-motion-toggle]').click();
  await waitPlaying(page, 0);
  await idle(page);
  await page.locator('[data-gallery] [data-motion-toggle]').click();
  await waitPlaying(page, 2);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await waitPlaying(page, 0);
  await idle(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await waitPlaying(page, 2);
  await page.locator('.about-teaser').scrollIntoViewIfNeeded();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await waitPlaying(page, 0);
  await idle(page);
  await gallery(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(
    () => document.querySelectorAll('canvas').length === 0,
  );
  await waitPlaying(page, 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(
    () => document.querySelectorAll('canvas').length === 1,
  );
  await select(page, ids[2]);
  await waitPlaying(page, 1);
  await page
    .locator('canvas')
    .evaluate((canvas) =>
      canvas
        .getContext('webgl2')
        .getExtension('WEBGL_lose_context')
        .loseContext(),
    );
  await page.waitForFunction(
    () => document.querySelectorAll('canvas').length === 0,
  );
  assert.equal(
    await page
      .locator('[data-preview-poster]')
      .evaluate((e) => getComputedStyle(e).opacity),
    '1',
  );
  assert(await page.locator('dialog').evaluate((e) => e.open));
  await page.screenshot({ path: `${out}/context-loss.png` });
  await close(page);
  assert((await page.evaluate(() => window.__maxPlaying)) <= 2);
  report.scenarios.push(
    'seven previews',
    'native study links',
    'history back/forward',
    'reload selected preview',
    'study/back restores preview',
    'single canvas after navigation',
    'pause/resume',
    'hidden document simulation',
    'offscreen pause',
    'idle rendering',
    'motion preference change',
    'context loss',
  );
  await page.evaluate(() => scrollTo(0, 0));
  // Context loss has already restored HTML; reverse motion was covered in the viewport checks.
  await context.close();

  for (const kind of [
    'reduced-motion',
    'no-webgl',
    'autoplay-denied',
    'video-error',
    'save-data',
    'safari-budget',
    'mobile-budget',
  ]) {
    const setup =
      kind === 'no-webgl'
        ? () => {
            const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (type, ...args) {
              return /webgl/.test(type)
                ? null
                : original.call(this, type, ...args);
            };
          }
        : kind === 'autoplay-denied'
          ? () => {
              window.__denyPlay = true;
              const original = HTMLMediaElement.prototype.play;
              HTMLMediaElement.prototype.play = function () {
                return window.__denyPlay
                  ? Promise.reject(
                      new DOMException(
                        'Test autoplay refusal',
                        'NotAllowedError',
                      ),
                    )
                  : original.call(this);
              };
            }
          : kind === 'save-data'
            ? () => {
                const connection = new EventTarget();
                connection.saveData = true;
                Object.defineProperty(navigator, 'connection', {
                  value: connection,
                });
              }
            : undefined;
    const options =
      kind === 'reduced-motion'
        ? { reducedMotion: 'reduce' }
        : kind === 'safari-budget'
          ? {
              userAgent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',
            }
          : kind === 'mobile-budget'
            ? {
                userAgent:
                  'Mozilla/5.0 (Linux; Android 13; Tablet) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
              }
            : {};
    const { context, page } = await make(options, setup);
    if (kind === 'video-error')
      await context.route('**/music-recommendation.mp4', (route) =>
        route.abort(),
      );
    await home(page);
    await gallery(page, !['no-webgl', 'reduced-motion'].includes(kind));
    await select(page, ids[2]);
    if (['reduced-motion', 'save-data'].includes(kind)) {
      assert.equal(await page.locator('video[src]').count(), 0);
      await waitPlaying(page, 0);
    } else if (kind === 'autoplay-denied') {
      await page.waitForFunction(() =>
        document
          .querySelector('[data-media-status]')
          .textContent.includes('Playback is paused'),
      );
      await waitPlaying(page, 0);
      await page.evaluate(() => {
        window.__denyPlay = false;
      });
      await page.locator('dialog [data-motion-toggle]').click();
      await waitPlaying(page, 1);
    } else if (kind === 'video-error') {
      await page.waitForFunction(() =>
        document
          .querySelector('[data-media-status]')
          .textContent.includes('unavailable'),
      );
      await waitPlaying(page, 0);
    } else await waitPlaying(page, 1);
    if (['no-webgl', 'reduced-motion'].includes(kind)) {
      assert.equal(await page.locator('canvas').count(), 0);
      assert.equal(
        await page
          .locator('[data-preview-poster]')
          .evaluate((e) => getComputedStyle(e).opacity),
        '1',
      );
    }
    if (['safari-budget', 'mobile-budget'].includes(kind))
      assert((await page.evaluate(() => window.__maxPlaying)) <= 1);
    await page.waitForFunction(
      () =>
        document.querySelectorAll('canvas').length === 0 ||
        document.querySelector('[data-scene-root]').dataset
          .selectionProgress === '1.000',
    );
    await page.screenshot({ path: `${out}/${kind}.png` });
    await close(page);
    console.log(`Fallback passed: ${kind}`);
    report.scenarios.push(kind);
    await context.close();
  }
  for (const kind of ['no-js', 'reduced-motion', 'no-webgl', 'context-loss']) {
    const { context, page } = await make(
      {
        javaScriptEnabled: kind !== 'no-js',
        reducedMotion: kind === 'reduced-motion' ? 'reduce' : 'no-preference',
      },
      kind === 'no-webgl'
        ? () => {
            const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (type, ...args) {
              return /webgl/.test(type)
                ? null
                : original.call(this, type, ...args);
            };
          }
        : undefined,
    );
    await page.goto(base + '/projects/', { waitUntil: 'networkidle' });
    if (kind === 'context-loss') {
      await page.waitForFunction(
        () => document.documentElement.dataset.panelsReady === 'true',
      );
      await page
        .locator('canvas')
        .evaluate((c) =>
          c
            .getContext('webgl2')
            .getExtension('WEBGL_lose_context')
            .loseContext(),
        );
    }
    await page.waitForFunction(
      () => document.querySelectorAll('canvas').length === 0,
    );
    assert.equal(await page.locator('.row-title').count(), 7);
    assert.equal(
      await page
        .locator('.works-fallback')
        .evaluate((e) => getComputedStyle(e).visibility),
      'visible',
    );
    assert(
      await page
        .locator('.works-fallback img')
        .evaluate((e) => e.complete && e.naturalWidth > 0),
    );
    assert.equal(await countPlaying(page), 0);
    await page.evaluate(() => document.fonts.ready);
    // Disabled-JS documents do not run page RAF callbacks. Allow the font raster to settle.
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/index-${kind}.png` });
    await page.locator('.row-title').first().click();
    await page.waitForURL(`**/projects/${ids[0]}/`);
    report.scenarios.push(`index ${kind}`);
    await context.close();
  }
  // A smaller CSS viewport represents reflow at desktop zoom; physical browser zoom remains a manual check.
  const zoom = await make({
    viewport: { width: 720, height: 450 },
    deviceScaleFactor: 2,
  });
  await zoom.page.goto(base + '/projects/', { waitUntil: 'networkidle' });
  assert.equal(
    await zoom.page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.equal(await zoom.page.locator('.row-title').count(), 7);
  await zoom.page.locator('.row-title').last().scrollIntoViewIfNeeded();
  assert(await zoom.page.locator('.row-title').last().isVisible());
  await zoom.context.close();
  report.scenarios.push('zoom reflow simulation');
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await noJS.newPage();
  await staticPage.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await staticPage.locator('[data-preview]:visible').count(), 0);
  assert.equal(await staticPage.locator('.row-title').count(), 7);
  assert.equal(await staticPage.locator('video[src]').count(), 0);
  await staticPage.locator(`[data-project-id="${ids[0]}"] .row-title`).click();
  await staticPage.waitForURL(`**/projects/${ids[0]}/`);
  await noJS.close();
  report.scenarios.push('no JavaScript');
  assert.deepEqual(report.errors, []);
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
