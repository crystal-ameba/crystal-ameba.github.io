import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://crystal-ameba.github.io';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },
});
