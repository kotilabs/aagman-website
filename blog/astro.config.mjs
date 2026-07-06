import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.aagman.ai',
  base: '/blog',
  output: 'static',
  outDir: './dist/blog',
  integrations: [sitemap(), mdx()],
  build: {
    format: 'directory',
  },
  markdown: {
    syntaxHighlight: false,
  },
});