const { chromium } = await import(
  process.env['PLAYWRIGHT_MODULE'] ?? 'playwright'
);
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const base = process.env['PORTFOLIO_BASE_URL'] ?? 'http://127.0.0.1:4321';
const out = process.env['PORTFOLIO_SCREENSHOTS'] ?? 'test-results/jalon-3';
const ids = [
  'rl-path-signatures',
  'signature-deep-hedging',
  'music-recommendation',
  'tinystories-transformer',
  'link-prediction',
  'visual-learning',
  'retail-forecasting',
];
const route = (id) => `/projects/${id}/`;
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const report = {
  checkedAt: new Date().toISOString(),
  browser: '',
  viewports: [],
  studies: [],
  navigation: {},
  noJavaScript: [],
  resume: {},
  errors: [],
};
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
report.browser = browser.version();
function monitor(page) {
  page.setDefaultTimeout(10000);
  page.on('pageerror', (error) => report.errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text());
  });
}
async function open(page, path) {
  const response = await page.goto(base + path, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, path);
}
async function layout(page) {
  return page.evaluate(() => {
    const bounds = (e) => {
      const r = e.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    };
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      elementsOutsideViewport: [
        ...document.querySelectorAll(
          'h1, figure, table, .method-diagram, .profile-section, .contact-email',
        ),
      ]
        .filter((e) => {
          const r = bounds(e);
          return r.left < -1 || r.right > innerWidth + 1;
        })
        .map((e) => e.tagName),
      tocPosition: document.querySelector('.table-of-contents')
        ? getComputedStyle(document.querySelector('.table-of-contents'))
            .position
        : null,
      methodSteps: [...document.querySelectorAll('.method-diagram li')].map(
        bounds,
      ),
    };
  });
}
async function captureAt(page, selector, filename) {
  await page
    .locator(selector)
    .first()
    .evaluate((e) =>
      window.scrollTo(0, scrollY + e.getBoundingClientRect().top - 40),
    );
  await page.screenshot({ path: `${out}/${filename}.png` });
}
try {
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    monitor(page);
    const checks = [];
    for (const path of [...ids.map(route), '/projects/', '/about/']) {
      await open(page, path);
      const metrics = await layout(page);
      assert.equal(
        metrics.overflow,
        false,
        `horizontal overflow: ${path} at ${width}`,
      );
      assert.deepEqual(
        metrics.elementsOutsideViewport,
        [],
        `element overflow: ${path} at ${width}`,
      );
      assert.equal(await page.locator('canvas').count(), 0);
      if (metrics.methodSteps.length) {
        assert.equal(metrics.methodSteps.length, 3);
        assert.equal(metrics.tocPosition, width > 900 ? 'sticky' : 'static');
        const [a, b] = metrics.methodSteps;
        if (width > 700)
          assert(Math.abs(a.top - b.top) < 1, 'horizontal method');
        else assert(b.top >= a.bottom - 1, 'vertical method');
      }
      checks.push({ path, ...metrics });
      if (path === route(ids[0])) {
        await page.screenshot({
          path: `${out}/study-header-${width}x${height}.png`,
        });
        await captureAt(
          page,
          '.project-figure',
          `study-figure-${width}x${height}`,
        );
        await captureAt(
          page,
          '.case-reading-layout',
          `study-method-${width}x${height}`,
        );
        await captureAt(
          page,
          '.editorial-prose table',
          `study-table-${width}x${height}`,
        );
      }
      if (path === '/about/') {
        await page.screenshot({ path: `${out}/about-${width}x${height}.png` });
        await captureAt(
          page,
          '#education-title',
          `education-${width}x${height}`,
        );
        await captureAt(page, '.contact-section', `contact-${width}x${height}`);
      }
      if (path === '/projects/')
        await captureAt(page, '.project-list', `index-${width}x${height}`);
    }
    report.viewports.push({ width, height, checks });
    console.log(`Content layouts: ${width} × ${height}, nine pages passed`);
    await context.close();
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  monitor(page);
  for (const [index, id] of ids.entries()) {
    await open(page, route(id));
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.contribution-summary li').count(), 3);
    assert.match(
      await page.locator('.project-figure figcaption').innerText(),
      /[Cc]onceptual/,
    );
    assert.match(
      await page.locator('.case-content > .editorial-note').innerText(),
      /Working case study/,
    );
    const words = (await page.locator('.editorial-prose').innerText()).match(
      /[\p{L}\p{N}]+(?:[’'–-][\p{L}\p{N}]+)*/gu,
    ).length;
    assert(
      words >= (index < 3 ? 600 : 250) && words <= (index < 3 ? 800 : 400),
      `${id}: ${words} words`,
    );
    const links = await page
      .locator('.table-of-contents a')
      .evaluateAll((es) => es.map((e) => e.getAttribute('href')));
    const headings = await page
      .locator('.editorial-prose h2')
      .evaluateAll((es) => es.map((e) => `#${e.id}`));
    assert.deepEqual(links, ['#method-overview', ...headings]);
    for (const href of links)
      assert.equal(await page.locator(href).count(), 1, href);
    await page.locator('.table-of-contents a').last().click();
    assert.equal(new URL(page.url()).hash, links.at(-1));
    assert(
      await page.locator(links.at(-1)).evaluate((e) => {
        const r = e.getBoundingClientRect();
        return r.top >= 0 && r.top < innerHeight;
      }),
    );
    const previousLink = page.locator('.project-navigation [rel="prev"]');
    const nextLink = page.locator('.project-navigation [rel="next"]');
    const previous = (await previousLink.count())
      ? await previousLink.getAttribute('href')
      : null;
    const next = (await nextLink.count())
      ? await nextLink.getAttribute('href')
      : null;
    assert.equal(previous, index === 0 ? null : route(ids[index - 1]));
    assert.equal(next, index === ids.length - 1 ? null : route(ids[index + 1]));
    const resources = await page
      .locator('.project-resources a')
      .evaluateAll((es) =>
        es.map((e) => ({
          href: e.getAttribute('href'),
          text: e.textContent.trim(),
        })),
      );
    assert(
      resources.every((r) => r.href && r.href !== '#'),
      'no placeholder resources',
    );
    report.studies.push({ id, words, toc: links, previous, next, resources });
  }

  // Traverse the rendered links, including the non-looping endpoints.
  await open(page, route(ids[0]));
  for (const id of ids.slice(1)) {
    await page.locator('.project-navigation [rel="next"]').click();
    await page.waitForURL(base + route(id));
  }
  for (const id of ids.slice(0, -1).reverse()) {
    await page.locator('.project-navigation [rel="prev"]').click();
    await page.waitForURL(base + route(id));
  }
  await page.locator('.collection-links a[href="/projects/"]').click();
  await page.waitForURL(base + '/projects/');
  assert.equal(await page.locator('.project-list > li').count(), 7);
  await page.goBack();
  await page.locator('.collection-links a[href="/#projects"]').click();
  await page.waitForURL(base + '/#projects');
  await page.waitForFunction(
    () => document.documentElement.dataset.panelsReady === 'true',
  );
  const panels = await page.locator('.gallery-grid li').evaluateAll((es) =>
    es.map((e) => ({
      id: e.dataset.projectId,
      top: e.getBoundingClientRect().top,
      bottom: e.getBoundingClientRect().bottom,
    })),
  );
  assert.equal(panels.length, 7);
  assert(
    panels.every((p) => p.top >= 0 && p.bottom <= 900),
    'all seven projects and titles visible',
  );
  await page.screenshot({ path: `${out}/gallery-1440x900.png` });
  report.navigation = {
    next: ids.slice(1),
    previous: ids.slice(0, -1).reverse(),
    index: true,
    gallery: panels,
  };

  await open(page, route(ids[0]));
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').innerText(), 'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main');
  const keyboardAnchors = [];
  for (
    let i = 0;
    i < 16 && keyboardAnchors.length < report.studies[0].toc.length;
    i++
  ) {
    await page.keyboard.press('Tab');
    const focus = await page.locator(':focus').evaluate((e) => ({
      href: e.getAttribute('href'),
      inToc: Boolean(e.closest('.table-of-contents')),
      outline: getComputedStyle(e).outlineStyle,
    }));
    if (focus.inToc) {
      assert.notEqual(focus.outline, 'none');
      keyboardAnchors.push(focus.href);
    }
  }
  assert.deepEqual(keyboardAnchors, report.studies[0].toc);
  await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).hash, keyboardAnchors.at(-1));
  report.navigation.keyboardAnchors = keyboardAnchors;

  await open(page, '/about/');
  const emailLinks = await page
    .locator('a[href^="mailto:"]')
    .evaluateAll((es) => es.map((e) => e.getAttribute('href')));
  assert(
    emailLinks.length > 0 &&
      emailLinks.every(
        (href) => href === 'mailto:emeryc.chuttarsing@berkeley.edu',
      ),
  );
  assert.equal(await page.locator('a[href*="linkedin.com"]').count(), 0);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('a[download]').first().click(),
  ]);
  const downloaded = await readFile(await download.path());
  const original = await readFile(
    'public/resume/emeryc-chuttarsing-resume.pdf',
  );
  assert.equal(sha256(downloaded), sha256(original));
  assert.equal(download.suggestedFilename(), 'emeryc-chuttarsing-resume.pdf');
  const response = await context.request.get(
    base + '/resume/emeryc-chuttarsing-resume.pdf',
  );
  assert.equal(response.status(), 200);
  assert.match(response.headers()['content-type'], /application\/pdf/);
  report.resume = {
    filename: download.suggestedFilename(),
    bytes: downloaded.length,
    sha256: sha256(downloaded),
    contentType: response.headers()['content-type'],
    email: emailLinks[0],
  };
  await context.close();

  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const staticPage = await noJS.newPage();
  monitor(staticPage);
  for (const id of ids) {
    await open(staticPage, route(id));
    assert.equal(await staticPage.locator('.method-diagram li').count(), 3);
    assert(
      (await staticPage.locator('.editorial-prose').innerText()).length > 1000,
    );
    await staticPage.locator('.table-of-contents a').last().click();
    assert(new URL(staticPage.url()).hash);
    assert.equal((await layout(staticPage)).overflow, false);
    report.noJavaScript.push(id);
  }
  await open(staticPage, '/about/');
  assert.equal(await staticPage.locator('a[download]').count(), 3);
  assert((await staticPage.locator('main').innerText()).includes('EquitX'));
  await noJS.close();
  assert.deepEqual(report.errors, []);
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    `Passed: ${report.studies.length} studies, navigation, keyboard, no JavaScript, CV and email. Captures: ${out}`,
  );
} finally {
  await browser.close();
}
