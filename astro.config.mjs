import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://emerycchuttarsing.github.io',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
