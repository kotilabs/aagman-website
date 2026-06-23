import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://aagman.ai';
const base = process.env.BASE_PATH || '/blog';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [sitemap()],
  outDir: './dist/blog',
  build: {
    format: 'directory',
  },
});
