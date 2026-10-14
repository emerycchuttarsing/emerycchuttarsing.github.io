const { chromium } = await import(
  process.env['PLAYWRIGHT_MODULE'] ?? 'playwright'
);
import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
const phase = process.argv[2] ?? 'after';
const dir =
  process.env['PORTFOLIO_SCREENSHOTS'] ??
  `test-results/orbit-performance/${phase}`;
const base = process.env['PORTFOLIO_BASE_URL'] ?? 'http://127.0.0.1:4321';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
// FPS counts only animation callbacks that submit actual WebGL draws.
// GPU timer queries are asynchronous: never wait for the GPU or use gl.finish().
const report = { browser: browser.version(), phase, layouts: [], errors: [] };
try {
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
    });
    await context.addInitScript(() => {
      const stats = (window.__profile = {
        frames: [],
        mutations: 0,
        gpu: null,
        timerSupported: false,
      });
      let gl,
        ext,
        pending = [],
        current;
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (...args) {
        const result = original.apply(this, args);
        if (args[0] === 'webgl2' && result) {
          gl = result;
          ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
          stats.timerSupported = Boolean(ext);
          const debug = gl.getExtension('WEBGL_debug_renderer_info');
          stats.gpu = debug
            ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
            : gl.getParameter(gl.RENDERER);
        }
        return result;
      };
      for (const name of ['drawElements', 'drawArrays']) {
        const original = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args) {
          if (current) current.draws++;
          return original.apply(this, args);
        };
      }
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = (fn) =>
        raf.call(window, (time) => {
          while (
            pending.length &&
            gl.getQueryParameter(pending[0].query, gl.QUERY_RESULT_AVAILABLE)
          ) {
            const { query, frame } = pending.shift();
            if (!gl.getParameter(ext.GPU_DISJOINT_EXT))
              frame.gpuMs = gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6;
            gl.deleteQuery(query);
          }
          const frame = { time, draws: 0, cpuMs: 0 };
          current = frame;
          let query;
          if (ext) {
            query = gl.createQuery();
            gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
          }
          const start = performance.now();
          try {
            fn(time);
          } finally {
            frame.cpuMs = performance.now() - start;
            if (query) {
              gl.endQuery(ext.TIME_ELAPSED_EXT);
              pending.push({ query, frame });
            }
            if (frame.draws) stats.frames.push(frame);
            current = undefined;
          }
        });
      new MutationObserver(
        (records) => (stats.mutations += records.length),
      ).observe(document, { attributes: true, childList: true, subtree: true });
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') report.errors.push(m.text());
    });
    await page.goto(`${base}/projects/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => document.documentElement.dataset.panelsReady === 'true',
    );
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    await page.waitForTimeout(3000);
    const start = await cdp.send('Performance.getMetrics');
    await page.evaluate(() => {
      window.__profile.frames = [];
      window.__profile.mutations = 0;
    });
    await page.waitForTimeout(6000);
    const end = await cdp.send('Performance.getMetrics');
    const data = await page.evaluate(() => window.__profile);
    const delta = {};
    for (const m of end.metrics)
      delta[m.name] =
        m.value - (start.metrics.find((s) => s.name === m.name)?.value ?? 0);
    function summary(values) {
      const v = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
      return {
        n: v.length,
        mean: v.reduce((a, b) => a + b, 0) / v.length,
        p50: v[Math.floor(v.length * 0.5)],
        p95: v[Math.floor(v.length * 0.95)],
        max: v.at(-1),
      };
    }
    const intervals = data.frames
      .slice(1)
      .map((f, i) => f.time - data.frames[i].time);
    assert.ok(data.frames.length > 0, 'the scene submitted rendered frames');
    const detail = {
      width,
      height,
      dpr: 2,
      gpu: data.gpu,
      timerSupported: data.timerSupported,
      renderFps: 1000 / summary(intervals).mean,
      intervalMs: summary(intervals),
      cpuCallbackMs: summary(data.frames.map((f) => f.cpuMs)),
      gpuMs: summary(data.frames.map((f) => f.gpuMs)),
      draws: summary(data.frames.map((f) => f.draws)),
      over25ms: intervals.filter((n) => n > 25).length,
      mutationsPerSecond: data.mutations / 6,
      mainThread: {
        taskMs: delta.TaskDuration * 1000,
        layoutMs: delta.LayoutDuration * 1000,
        styleMs: delta.RecalcStyleDuration * 1000,
        layoutCount: delta.LayoutCount,
        styleCount: delta.RecalcStyleCount,
      },
    };
    report.layouts.push(detail);
    console.log(JSON.stringify(detail));
    await page.screenshot({ path: `${dir}/drifting-${width}.png` });
    if (width === 1440) {
      await page.locator('[data-project-id="music-recommendation"]').hover();
      await page.waitForFunction(
        () =>
          document.querySelector('[data-scene-root]').dataset.orbitState ===
          'focused',
      );
      await page.screenshot({ path: `${dir}/focused-featured.png` });
    }
    // Keep summaries compact; the samples are available while debugging the page.
    await context.close();
  }
  await writeFile(`${dir}/report.json`, JSON.stringify(report, null, 2));
  assert.deepEqual(report.errors, [], 'no browser or shader errors');
} finally {
  await browser.close();
}
