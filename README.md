# Ritvik Prabhu — research & writing

A static Astro + TypeScript academic portfolio and Markdown/MDX blog. Production URL: <https://ritvikprabhu.github.io/>. No CMS, client framework, database, or server adapter is required.

## Local development

Use Node **24 LTS** (Astro requires Node >=22.22) and npm.

```sh
npm ci
npm run dev
npm run check
npm run format:check
npm run build
npm run preview
```

`npm run format` formats the source. Builds write to `dist/`. In Amp orbs, `amp orb services ensure` starts the declared preview service; use the Portal tab to review it.

## Add a publication

Edit `src/data/publications.json`. This is the only publication source; Astro validates it through the `publications` collection in `src/content.config.ts`. Copy an existing entry, assign a unique `id`, and update:

```json
{
  "id": "short-stable-paper-id",
  "type": "publication",
  "category": "Papers",
  "title": "Paper title",
  "authors": "R Prabhu, A Collaborator",
  "year": 2026,
  "venue": "Full venue name",
  "venueShort": "VENUE",
  "status": "Published",
  "summary": "A short, factual description.",
  "selected": true,
  "links": { "Paper": "https://example.org/paper" },
  "sortOrder": 0
}
```

Entries are ordered by descending year, then ascending `sortOrder`. Home shows up to three `selected` entries, or the three latest if none are selected. The full page groups everything by year. Any nonempty link label/URL in `links` is rendered, including Paper, Code, arXiv, Slides, or BibTeX URLs. Optional top-level `doi` (bare DOI), `arxiv`, `paper`, `code`, `slides`, `bibtex` (citation text), `award`, and `pdfPath` (local `/papers/file.pdf`) are also supported. Do not duplicate links in both forms. Empty optional fields should be omitted.

`summary` appears behind a native, keyboard-accessible disclosure. A longer `abstract` is used only with `abstractReviewed: true`; otherwise the summary is used. Original areas, methods, systems, keywords, category, ordering, and short titles remain in the data even when not shown in the text-first UI.

## Write a post

Create `src/content/writing/my-post.md` or `.mdx`:

```yaml
---
title: "A descriptive title"
description: "A short summary for listings and search."
published: 2026-10-19
# updated: 2026-10-20
draft: true
tags: [HPC, Systems]
---
```

Write the body below the frontmatter. Begin sections at `##`; the layout supplies the H1. Use fenced code blocks with a language, Markdown tables, blockquotes, and `$inline math$` or `$$display math$$`. Images in `public/` can be referenced with `/images/name.webp`. In MDX, import an asset and Astro's `Image` for optimized images; see `example.mdx` for a working reference, figures, and captions.

Set `draft: false` when ready and commit. Drafts are excluded from generated routes, lists, sitemap, and RSS. The filename becomes the stable `/writing/my-post/` URL; dates do not change it. Dates are displayed in UTC to avoid calendar-day shifts. A table of contents appears when there are at least four level-two sections. Posts receive canonical and OpenGraph metadata automatically. RSS is `/rss.xml`.

The single `example.mdx` is visibly labeled, `noindex`, and excluded from regular post lists, RSS, and sitemap. Remove it and its linked aside in `src/pages/writing/index.astro` when no longer needed. It is not attributed to Ritvik as a real post.

## Profile, About, and design

- `src/data/site.ts`: name, homepage introduction, About biography paragraphs, contact/profile URLs, location, and optional CV URL.
- `src/data/experience.ts`: research, internships, education, awards/recognition, and professional service. About information was updated from the owner-provided resume; edit these arrays to keep it current.
- `src/data/news.json`: archived original news items; no longer displayed on About.
- `src/pages/about.astro`: About layout; content comes from the data files above. Expected graduation dates and award nominations are explicitly labeled, and unknown dates are omitted.
- `src/assets/portrait.jpg`: preserved original portrait, optimized by Astro at build time.
- `src/styles/global.css`: semantic light/dark colors, width/spacing/type tokens, responsive layouts, prose, reduced motion.
- `src/layouts/BaseLayout.astro`: shared document, navigation, metadata, footer, theme, and Astro page transitions.
- `public/social.png` and `public/favicon.svg`: social preview and favicon.

No CV document existed in the original repository. To add one, place it at `public/cv.pdf` and set `site.cv` to `/cv.pdf`; it automatically appears in the navigation and profile links. Do not add an empty document or dead link.

The interface uses system sans-serif and platform serif fonts (no font network requests), one teal accent, native disclosure controls, and minimal JavaScript. Theme follows the OS until explicitly changed; explicit preference persists. Core content and navigation work without JavaScript. Animations honor reduced motion.

## Deployment

`.github/workflows/deploy.yml` runs `npm ci`, formatting, Astro/TypeScript checks, and the static build on PRs and pushes to `main`. PRs **do not deploy**. On `main`, it uploads `dist/` and deploys with the GitHub Pages actions. Repository Settings → Pages must use **GitHub Actions** (as for the old workflow). No manual copying of source HTML is involved. `astro.config.mjs` sets the user-site domain root, with no repository subpath.

Old `/experience.html` and `/publications.html` links remain as small static redirect documents. `/index.html` continues to resolve to the homepage. The 404 page, robots.txt, sitemap, canonicals, and RSS are generated or shipped with the static site.

## Migration notes and references

All seven original publications and their metadata/URLs, six experience entries, three news items, profile links, email, and portrait were migrated. Scholar and LinkedIn URLs came from the old HTML (the old profile JSON contained placeholders). About was subsequently updated from the owner-provided resume: it now includes DSSL, separate 2025 and 2026 Oak Ridge internships, Synergy’s July 2026 end date, degree details, awards, and service. Embedded resume hyperlinks were retained on the corresponding entries. After owner review, Education leads the CV sections, jump links provide section navigation, and the news section was removed (its original data is archived). The uploaded resume PDF itself is not published. Publication records remain unchanged, including the original IPDPS “To appear” status.

Design/architecture references: [Tanuj Ravi Rao](https://tansanrao.com/) and [Astro MultiPage Portfolio](https://github.com/tomcomtang/astro-multiplepage-portfolio). The implementation is original: it borrows the ideas of small dedicated pages, shared layouts, and text-first content, not reference text, CSS, artwork, or digital-garden features. Tailwind and template client-side post rendering were unnecessary for this small CSS-token-based design.
