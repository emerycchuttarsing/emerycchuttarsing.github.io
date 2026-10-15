const { chromium } = await import(
  process.env['PLAYWRIGHT_MODULE'] ?? 'playwright'
);
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env['PORTFOLIO_BASE_URL'] ?? 'http://127.0.0.1:4321';
const out =
  process.env['PORTFOLIO_SCREENSHOTS'] ?? 'test-results/orbit-gallery';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = {
  checkedAt: new Date().toISOString(),
  browser: browser.version(),
  focuses: [],
  layouts: [],
  errors: [],
};
const ids = [
  'rl-path-signatures',
  'signature-deep-hedging',
  'music-recommendation',
  'visual-learning',
  'link-prediction',
  'tinystories-transformer',
  'retail-forecasting',
];
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await context.addInitScript(() => {
  window.__rafRequests = 0;
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb) => {
    window.__rafRequests++;
    return raf(cb);
  };
});
const page = await context.newPage();
page.on('pageerror', (e) => report.errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text());
});
const state = () =>
  page.locator('[data-scene-root]').evaluate((e) => ({
    angle: Number(e.dataset.orbitAngle),
    speed: Number(e.dataset.orbitVelocity),
    state: e.dataset.orbitState,
    active: e.dataset.activeProject,
    focus: JSON.parse(e.dataset.panelFocus),
    panels: JSON.parse(e.dataset.panelBounds),
    raf: window.__rafRequests,
  }));
try {
  await page.goto(base + '/projects/', { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => document.documentElement.dataset.panelsReady === 'true',
  );
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2200);
  const first = await state();
  await page.waitForTimeout(1500);
  const second = await state();
  assert(
    second.angle - first.angle > 0.05 && second.angle - first.angle < 0.2,
    'slow continuous orbit',
  );
  assert(
    second.focus.every((p) => p.blur > 2),
    'all idle images are softly focused',
  );
  report.drift = {
    angleDelta: second.angle - first.angle,
    seconds: 1.5,
    radiansPerSecond: second.speed,
  };
  await page.screenshot({ path: `${out}/drifting-1440x900.png` });
  const historyLength = await page.evaluate(() => history.length);
  for (const [index, id] of ids.entries()) {
    const start = Date.now();
    await page.locator(`[data-project-id="${id}"]`).hover();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-scene-root]').dataset.orbitState ===
        'focused',
      {},
      { timeout: 15000 },
    );
    const current = await state();
    const error = Math.atan2(
      Math.sin(current.angle + (index / 7) * Math.PI * 2),
      Math.cos(current.angle + (index / 7) * Math.PI * 2),
    );
    assert(Math.abs(error) < 0.001, 'active project faces forward');
    assert.equal(current.speed, 0, 'orbit settles to rest');
    assert.equal(
      current.focus.find((p) => p.id === id).blur,
      0,
      'focused panel has full sharpness',
    );
    assert(
      current.focus.filter((p) => p.id !== id).every((p) => p.blur > 2),
      'other panels remain soft',
    );
    const panel = current.panels.find((p) => p.id === id);
    assert(
      Math.abs((panel.left + panel.right) / 2 - 720) < 5,
      'focused image centred',
    );
    assert.equal(
      await page.evaluate(() => history.length),
      historyLength,
      'hover preserves history',
    );
    assert.equal(await page.locator('dialog').evaluate((e) => e.open), false);
    report.focuses.push({ id, settleMs: Date.now() - start, ...current });
    if (index === 2 || index === 4)
      await page.screenshot({
        path: `${out}/focused-${index === 2 ? 'featured' : 'secondary'}.png`,
      });
  }
  await page.locator('.row-title').nth(1).focus();
  await page.locator('.project-row').nth(6).hover();
  assert.equal(
    (await state()).active,
    ids[6],
    'pointer interaction takes over from retained keyboard focus',
  );
  await page.locator('h1').click();
  await page.mouse.move(5, 5);
  // Preserve inertia when leaving during a retarget; then recover the slow cruise.
  await page.waitForFunction(
    () =>
      Number(
        document.querySelector('[data-scene-root]').dataset.orbitVelocity,
      ) > 0.06,
    {},
    { timeout: 6000 },
  );
  const released = await state();
  await page.waitForTimeout(1000);
  assert(
    (await state()).angle > released.angle,
    'leaving the list resumes the drift',
  );
  await page.locator('[data-gallery] [data-motion-toggle]').click();
  await page.waitForTimeout(1500);
  const paused = await state();
  await page.waitForTimeout(800);
  const still = await state();
  assert.equal(still.angle, paused.angle, 'pause freezes the orbit');
  assert.equal(still.raf, paused.raf, 'no perpetual RAF when paused');
  assert(
    still.focus.every((p) => p.blur === 0),
    'pause shows sharp still images',
  );
  await page.locator('[data-gallery] [data-motion-toggle]').click();
  await page.waitForTimeout(1200);
  assert.notEqual((await state()).angle, paused.angle);
  for (const n of [0, 5, 2, 4]) {
    await page.locator('.project-row').nth(n).hover();
    await page.waitForTimeout(80);
  }
  await page.waitForFunction(
    () =>
      document.querySelector('[data-scene-root]').dataset.orbitState ===
      'focused',
    {},
    { timeout: 15000 },
  );
  assert.equal(
    (await state()).active,
    ids[4],
    'rapid changes settle on the latest target',
  );
  await page.locator('.row-title[data-preview="link-prediction"]').click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-scene-root]').dataset.selectionProgress ===
      '1.000',
  );
  assert.equal(
    (await state()).focus.find((p) => p.id === ids[4]).blur,
    0,
    'preview stays sharp',
  );
  await page.keyboard.press('Escape');
  assert.equal(
    await page
      .locator('.row-title')
      .nth(4)
      .evaluate((el) => el === document.activeElement),
    true,
    'closing the preview restores focus to its trigger',
  );
  await page.locator('.project-row').nth(1).hover();
  assert.equal(
    (await state()).active,
    ids[1],
    'hover selects another project immediately after closing a preview',
  );
  await page.mouse.move(5, 5);
  assert.equal(
    (await state()).active,
    '',
    'leaving clears the retained selection',
  );
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(700);
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      rows: document.querySelectorAll('.row-title').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      canvasCount: document.querySelectorAll('canvas').length,
    }));
    assert.equal(layout.rows, 7);
    assert.equal(layout.overflow, false);
    assert.equal(layout.canvasCount, 1);
    report.layouts.push(layout);
    await page.screenshot({
      path: `${out}/orbit-${width}x${height}.png`,
      fullPage: width === 390,
    });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(
    () => document.querySelectorAll('canvas').length === 0,
  );
  assert.equal(await page.locator('.row-title').count(), 7);
  await page.screenshot({
    path: `${out}/reduced-motion-mobile.png`,
    fullPage: true,
  });
  assert.deepEqual(report.errors, []);
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        focuses: report.focuses.map((f) => ({
          id: f.id,
          settleMs: f.settleMs,
        })),
        drift: report.drift,
        layouts: report.layouts,
        errors: report.errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
