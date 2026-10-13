// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://danny0411.github.io',
  base: '/pokesurvivor-guide',
  trailingSlash: 'always',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  markdown: { syntaxHighlight: false },
});
