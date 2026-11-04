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
  "publicationType": "Conference",
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

Entries are ordered by descending year, then ascending `sortOrder`. Home always shows the three most recent entries. The full page groups everything by year. Any nonempty link label/URL in `links` is rendered, including Paper, Code, arXiv, Slides, or BibTeX URLs. Optional top-level `doi` (bare DOI), `arxiv`, `paper`, `code`, `slides`, `bibtex` (citation text), `award`, and `pdfPath` (local `/papers/file.pdf`) are also supported. Do not duplicate links in both forms. Empty optional fields should be omitted.

Set `publicationType` to `Conference`, `Journal`, or `Workshop`. The Publications page displays these labels and offers keyboard-accessible type filters plus search across title, authors, venue, year, and type. Search terms combine with the selected type. Reset restores the complete list. With JavaScript disabled, all publications remain readable and the interactive controls stay hidden. Empty year groups are hidden when filtering; there is no separate year navigation.

Publication summaries and abstracts are not displayed. Original summaries, abstracts, areas, methods, systems, keywords, category, ordering, and short titles remain in the data for reference. The full page has no venue abbreviation column; the full venue remains below each author list.

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
# Optional optimized listing thumbnail, relative to this Markdown file:
# thumbnail:
#   src: ../../assets/my-post.webp
#   alt: "A description of the image"
---
```

Write the body below the frontmatter. Begin sections at `##`; the layout supplies the H1. Use fenced code blocks with a language, Markdown tables, blockquotes, and `$inline math$` or `$$display math$$`. Images in `public/` can be referenced with `/images/name.webp`. In MDX, import an asset and Astro's `Image` for optimized images; see `example.mdx` for a working reference, figures, and captions.

Set `draft: false` when ready and commit. Drafts are excluded from generated routes, lists, sitemap, and RSS. The filename becomes the stable `/writing/my-post/` URL; dates do not change it. Dates are displayed in UTC to avoid calendar-day shifts. A table of contents appears when there are at least four level-two sections. Posts receive canonical and OpenGraph metadata automatically. RSS is `/rss.xml`.

The navigation and page title call this section **Blog**, while `/writing/` and article URLs stay unchanged. Tags become topic filters automatically. Search matches title, description, date, and topics, and combines with the selected topic. Reset clears both. The shared `ContentFilters.astro` supplies the same accessible behavior for publications and posts, with no client framework or search service.

An optional `thumbnail` contains a local `src` and required descriptive `alt`. Astro validates and optimizes it, and rows without images stay text-only. The same post rows appear on Home and the Blog page. The single `example.mdx` demonstrates formatting and thumbnail frontmatter but remains a draft in the repository. It has no public route and never appears in listings, topic filters, RSS, or sitemap. No example content is displayed on the website.

Both search interfaces keep result counts screen-reader-only, with compact spacing between filters and results.

## “From First Principles to Modern LLMs” series

The Blog page at `/writing/` is a multi-series library. One click anywhere on a series card opens `/writing/series/<id>/`, showing all available post cards directly. One click anywhere on a post card opens the article. There are no act pages, expand controls, or intermediate screens. Only published, non-example posts are shown; no roadmap, future titles, empty acts, draft counts, or planned totals reach the public UI. A series with no posts has a simple empty state and RSS link. Standalone posts keep a separate chronological, searchable list below the series cards.

### Add a chapter

1. Copy `templates/series-post.md` to `src/content/writing/your-stable-slug.md` (or `.mdx`). The template lives outside the content collection and can never become a public page accidentally.
2. Set the title, description, actual publication date, and the series metadata:

   ```yaml
   series:
     id: first-principles-to-modern-llms
     order: 1
   ```

   `id` matches an entry in `src/data/series.json`; `order` is a positive integer, unique among published posts within that series. Order values may have gaps to reserve space for drafts, but public cards and article positions are numbered contiguously across available posts. Dates never control series order. Omit the entire `series` field for a standalone post. Unknown series and duplicate published positions fail the build.

3. Keep `draft: true` while writing. Follow the five scaffold sections: question → mathematics → implementation → experiment → next limitation. The prompts ask for tensor shapes, complexity, a correct baseline and improvement, correctness/speed/memory/scaling comparisons, and reproducibility details. Replace prompts with real writing and measured evidence; do not publish an empty scaffold.
4. Set `draft: false` when ready. Run `npm run check`, `npm run format:check`, and `npm run build`. The series page adds the post card automatically. Each article gets its position among available posts, a five-section table of contents, series link, and previous/next available posts. The latest post says “You’re up to date,” never inventing a future title or claiming the series is finished.

The full four-act LLM roadmap remains in `templates/llm-roadmap.md`, outside the public content collection. It is authoring guidance only and is not imported by the site. A post’s filename is its stable URL; `series.order` controls its reading position independently.

### Add another series

Append an object to `src/data/series.json` with a unique URL-safe `id`, `title`, `description`, local `cover` path, `coverAlt`, optional `coverCaption`, and `sortOrder` (ascending library order). Copy the existing entry as a starting point. The collection validates the fields, and the catalog card and series page are generated automatically, even before the first post. No new component or route is needed. Add posts with that ID and their intended order using the same scaffold.

Run `node --test tests/series.test.mjs` for the publishing regression test. It builds with temporary series/posts, checks catalog-to-series-to-article links, independent series ordering, draft exclusion, published-only navigation, and invalid/duplicate assignments, then removes its fixtures and rebuilds the real site. Run it separately from other builds or content editing.

### Replace the temporary cover

Replace `public/images/llm-series-cover.jpg` with the supplied image, or change the entry’s `cover` in `src/data/series.json` to a different local public path. Update `coverAlt` with an accurate description and replace/remove `coverCaption`. Both the library card and series page use the same cover. It is cropped to 4:3 on desktop and 16:9 on narrow screens; choose a landscape with room around its subject. It is a local file, so visitors do not depend on an external image host.

The temporary landscape comes from [Unsplash](https://images.unsplash.com/photo-1470770841072-f978cf4d019e). It is only a replaceable visual placeholder, not an article illustration.

## Profile, About, and design

- `src/data/site.ts`: name, homepage introduction, single-paragraph About biography, contact/profile URLs, location, and optional CV URL. Email is `ritvikp@vt.edu`.
- `src/data/experience.ts`: research, work experience, education, awards/recognition, and professional service. About displays a short, non-first-person `summary` for each role. Original detail bullets and GPAs remain in the data for reference but are not rendered. The Work experience section retains its original `#internships` anchor so existing links still work.
- `src/data/news.json`: homepage news, most recent first; Home displays up to three items.
- `src/pages/about.astro`: About layout; content comes from the data files above. Expected graduation dates and award nominations are explicitly labeled, and unknown dates are omitted.
- `src/assets/portrait-frontier.jpg`: current About photo supplied by the owner, cropped for the circular portrait and optimized by Astro at build time. The original `src/assets/portrait.jpg` remains available as an asset.
- `src/styles/global.css`: semantic light/dark colors, width/spacing/type tokens, responsive layouts, prose, reduced motion.
- `src/layouts/BaseLayout.astro`: shared document, navigation, metadata, footer, theme, and Astro page transitions.
- `public/social.png` and `public/favicon.svg`: social preview and favicon.

The favicon is a handwritten **rp** drawn as SVG paths on a transparent background, without an enclosing tile. It switches from charcoal to warm ivory for dark browser themes using `prefers-color-scheme`. It uses no font or external assets, so its letterform is consistent across browsers.

External profile, publication, and About links open in a new tab with `noopener noreferrer`. Markdown/MDX external web links use the same behavior automatically. Internal navigation and article anchors stay in the current tab, and email links use the mail app. CV and publication documents also open separately.

No CV document existed in the original repository. To add one, place it at `public/cv.pdf` and set `site.cv` to `/cv.pdf`; it automatically appears in the navigation and profile links. Do not add an empty document or dead link.

The interface uses system sans-serif and platform serif fonts (no font network requests), one teal accent, native controls, and minimal JavaScript. Regular text and metadata are at least 18px, and section links are 20px. `ProfileLinks.astro` reuses the original site's inline SVG icons with accessible names and 44px targets. Theme follows the OS until explicitly changed; explicit preference persists. The homepage greeting types once, reserves its full layout, and ends with a blinking cursor. Reduced motion shows the full greeting immediately with a static cursor. Other animations also honor reduced motion.

## Deployment

`.github/workflows/deploy.yml` runs `npm ci`, formatting, Astro/TypeScript checks, and the static build on PRs and pushes to `main`. PRs **do not deploy**. On `main`, it uploads `dist/` and deploys with the GitHub Pages actions. Repository Settings → Pages must use **GitHub Actions** (as for the old workflow). No manual copying of source HTML is involved. `astro.config.mjs` sets the user-site domain root, with no repository subpath.

Old `/experience.html` and `/publications.html` links remain as small static redirect documents. `/index.html` continues to resolve to the homepage. The 404 page, robots.txt, sitemap, canonicals, and RSS are generated or shipped with the static site.

## Migration notes and references

All seven original publications and their metadata/URLs, six experience entries, three news items, profile links, email, and portrait were migrated. Scholar and LinkedIn URLs came from the old HTML (the old profile JSON contained placeholders). About was subsequently updated from the owner-provided resume: it now includes DSSL, separate 2025 and 2026 Oak Ridge internships, Synergy’s July 2026 end date, degree details, awards, and service. Embedded resume hyperlinks were retained on the corresponding entries. After owner review, Education leads the CV sections, jump links provide section navigation, experience is summarized without bullets, and news is shown on Home rather than About. The uploaded resume PDF itself is not published. The IPDPS 2026 record now links to IEEE Xplore document 11575339 and is marked Published, verified against the publisher's record (DOI 10.1109/IPDPS65963.2026.00035).

Design/architecture references: [Tanuj Ravi Rao](https://tansanrao.com/) and [Astro MultiPage Portfolio](https://github.com/tomcomtang/astro-multiplepage-portfolio). The implementation is original: it borrows the ideas of small dedicated pages, shared layouts, and text-first content, not reference text, CSS, artwork, or digital-garden features. Tailwind and template client-side post rendering were unnecessary for this small CSS-token-based design.
