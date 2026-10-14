import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { parse } from 'parse5';
import config from '../astro.config.mjs';

const output = resolve('dist');
const origin = new URL(config.site).origin;
const entries = (await readdir('src/content/projects')).filter((file) =>
  file.endsWith('.md'),
);
assert.equal(entries.length, 7, 'Expected seven source projects');
const projectRoutes = entries.map((file) => `/projects/${file.slice(0, -3)}/`);
const expectedRoutes = [
  '/',
  '/projects/',
  '/about/',
  '/404.html',
  ...projectRoutes,
];
const errors = [];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function flatten(node) {
  return [node, ...(node.childNodes ?? []).flatMap(flatten)];
}

function attr(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value;
}

function outputPath(pathname) {
  const path = decodeURIComponent(pathname);
  return resolve(output, `.${path}`, path.endsWith('/') ? 'index.html' : '');
}

const files = await walk(output);
const documents = new Map();
for (const file of files.filter((path) => path.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const nodes = flatten(parse(html));
  const ids = nodes.map((node) => attr(node, 'id')).filter(Boolean);
  if (new Set(ids).size !== ids.length)
    errors.push(`${relative(output, file)}: duplicate HTML IDs`);
  if (nodes.filter((node) => node.tagName === 'h1').length !== 1)
    errors.push(`${file}: expected one h1`);
  if (
    !nodes.some(
      (node) => node.tagName === 'html' && attr(node, 'lang') === 'en',
    )
  )
    errors.push(`${file}: missing English language`);
  if (
    !nodes.some(
      (node) =>
        node.tagName === 'meta' &&
        attr(node, 'name') === 'description' &&
        attr(node, 'content'),
    )
  )
    errors.push(`${file}: missing description`);
  if (
    !nodes.some(
      (node) =>
        node.tagName === 'title' &&
        node.childNodes?.some((child) => child.value?.trim()),
    )
  )
    errors.push(`${file}: missing page title`);
  if (/\/(?:Users|private)\//.test(html))
    errors.push(`${file}: local filesystem path in published HTML`);
  documents.set(file, { nodes, ids: new Set(ids) });
}

for (const route of expectedRoutes) {
  if (!documents.has(outputPath(route)))
    errors.push(`Missing generated route: ${route}`);
}
assert.equal(
  documents.size,
  expectedRoutes.length,
  'Unexpected number of generated pages',
);

let checkedReferences = 0;
for (const [file, document] of documents) {
  const route = `/${relative(output, file).replace(/index\.html$/, '')}`;
  const internalLinks = new Set();
  for (const node of document.nodes) {
    for (const attribute of node.attrs ?? []) {
      if (!['href', 'src', 'poster'].includes(attribute.name)) continue;
      const value = attribute.value;
      if (!value || value === '#' || /^javascript:/i.test(value)) {
        errors.push(`${route}: empty or inactive ${attribute.name}`);
        continue;
      }
      const url = new URL(value, new URL(route, origin));
      if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol))
        continue;
      if (node.tagName === 'a') internalLinks.add(url.pathname);
      const target = outputPath(url.pathname);
      const asset = await stat(target).catch(() => null);
      if (!asset?.isFile())
        errors.push(`${route}: missing internal resource ${url.pathname}`);
      if (
        url.hash &&
        documents.has(target) &&
        !documents.get(target).ids.has(decodeURIComponent(url.hash.slice(1)))
      ) {
        errors.push(`${route}: missing anchor ${url.pathname}${url.hash}`);
      }
      checkedReferences++;
    }
  }
  if (['/', '/projects/'].includes(route)) {
    for (const project of projectRoutes) {
      if (!internalLinks.has(project))
        errors.push(`${route}: project is unreachable: ${project}`);
    }
  }
}

for (const file of files) {
  const path = relative(output, file);
  if (
    /^(?:docs|src|scripts|node_modules)\//.test(path) ||
    ['.md', '.pt', '.ipynb', '.env'].includes(extname(path))
  ) {
    errors.push(`Working file leaked into build: ${path}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${documents.size} HTML pages, ${projectRoutes.length} project routes and ${checkedReferences} internal references.`,
  );
}
