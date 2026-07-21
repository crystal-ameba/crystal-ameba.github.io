# crystal-ameba.github.io

Source for the [Ameba](https://github.com/crystal-ameba/ameba) website,
<https://crystal-ameba.github.io>.

Built with [Astro](https://astro.build). Blog search is powered by
[Pagefind](https://pagefind.app).

## Develop

```sh
npm install
npm run dev          # http://localhost:4321
```

> Search relies on a build-time index, so it only returns results in
> `npm run preview` and in production — not in `npm run dev`.

## Build

```sh
npm run build        # outputs to dist/ and generates the Pagefind index
npm run preview      # serve the production build locally
```

## Structure

```sh
src/
  pages/             # routes (index, blog, rss.xml, 404)
  layouts/           # BaseLayout, BlogPost
  components/        # Nav, Footer, Terminal, SearchModal
  content/blog/      # blog posts (Markdown)
  styles/global.css  # design tokens and shared styles
public/              # static assets served as-is
```

## Writing a post

Add a Markdown file to `src/content/blog/`. Front matter:

```yaml
---
title: "Post title"
description: "One-sentence summary used in listings and meta tags."
pubDate: 2024-01-31
category: "Release announcement"
tags:
  - releases
---
```

The file name becomes the URL slug, e.g. `internals.md` → `/blog/internals`.

## Deployment

Pushing to the `site` branch triggers
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the
site and publishes `dist/` to the `master` branch that GitHub Pages serves.
