import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

const SITE = 'https://crystal-ameba.github.io';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [sitemap(), pagefind()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },
});
