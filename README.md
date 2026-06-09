# Ritvik academic website

This is a static personal academic website for Ritvik Prabhu. The homepage is intentionally simple:

1. Full-screen intro with portrait, short bio, and links
2. Recent publications
3. A graph of published research artifacts

The top navigation is:

```text
Home | Publications | CV
```

There is no separate contact page; contact/social links live under the homepage intro.

---

## Run locally

Install dependencies once:

```bash
npm install
```

Generate the publication graph:

```bash
npm run build:graph
```

Start the local development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

---

## Data model

The site is metadata-driven. Do not hardcode publication entries into HTML.

The important files are:

```text
data/
├── artifacts.json        # Main editable database for publications/artifacts
├── publications.json     # Publication-only mirror used by publication views
└── research-graph.json   # Generated file; do not manually edit
```

PDFs should go here:

```text
assets/papers/
```

The graph is generated from published research artifacts only. It does **not** create method nodes, concept nodes, venue nodes, or a central root node. Each graph node represents one published/publishable research artifact. Edges represent similarity between artifacts based on metadata such as title, summary, areas, systems, and keywords.

On the graph, nodes show only a short readable title, for example:

```text
Genomic Needles
Arrow vs MPI
SparkLeBLAST
```

Venue/year/authors appear only after clicking a node or in the publication list.

---

## Add a new paper or artifact

When you have a new paper, workshop paper, preprint, poster, or other research artifact, do this:

### 1. Add the PDF, if available

Place the PDF in:

```text
assets/papers/
```

Use a simple filename, for example:

```text
assets/papers/genomic-needles-ipdps-2026.pdf
```

### 2. Add the metadata

Edit both:

```text
data/artifacts.json
data/publications.json
```

Add a new object like this:

```json
{
  "id": "my-paper-2027",
  "type": "publication",
  "category": "Papers",
  "shortTitle": "My Paper",
  "title": "Full Title of My Paper",
  "authors": "R Prabhu, A Collaborator, W Feng",
  "venue": "Conference or Journal Name",
  "venueShort": "CONF",
  "year": 2027,
  "status": "Published",
  "summary": "One plain-English sentence describing what this paper does.",
  "abstract": "A slightly longer abstract or description shown when someone clicks the graph node.",
  "areas": ["High-Performance Computing", "Machine Learning Systems"],
  "systems": ["CUDA", "MPI", "PyTorch"],
  "keywords": ["GPU", "distributed training", "optimization"],
  "links": {
    "pdf": "assets/papers/my-paper-2027.pdf",
    "paper": "https://example.com/paper-page",
    "arxiv": "https://arxiv.org/abs/xxxx.xxxxx",
    "code": "https://github.com/example/repo",
    "slides": "assets/slides/my-talk.pdf",
    "bibtex": "#"
  }
}
```

Only include links that actually exist. Empty or `#` links are hidden or shown as unavailable depending on the page.

### 3. Choose the correct category

Use one of these values:

```text
Papers
Workshop Papers
Preprints
```

Examples:

```json
"category": "Papers"
```

```json
"category": "Workshop Papers"
```

```json
"category": "Preprints"
```

### 4. Use a good `shortTitle`

The graph uses `shortTitle` as the node label, so keep it readable and short.

Good examples:

```text
Genomic Needles
Arrow vs MPI
SparkLeBLAST
CT Enhancement
ResearchBot
Plant Phenotypes
```

Avoid labels like:

```text
P1
Paper 2026
A Comparative Study of...
```

### 5. Regenerate the graph

After editing the metadata, run:

```bash
npm run build:graph
```

This updates:

```text
data/research-graph.json
```

Do not manually edit `research-graph.json`; it is generated.

### 6. Check the site

Run:

```bash
npm run dev
```

Check:

- Homepage recent publications shows the newest 3 publications.
- Publications page shows the full list under the correct category.
- The graph node appears with the short title only.
- Clicking the node opens the full details and links.
- PDF links open correctly if a PDF was provided.

---

## Edit profile / CV

Profile text and contact links are in:

```text
data/profile.json
```

The CV page is in:

```text
cv.html
```

The PDF CV lives in:

```text
assets/Prabhu_Ritvik_CV_05312026.pdf
```

Replace this file when the CV changes and update links if the filename changes.

---

## Deployment checklist

Before deploying:

```bash
npm run build:graph
npm run build
```

Then deploy the static site to GitHub Pages, Netlify, Vercel, or any normal web server.

Make sure these files are committed:

```text
data/artifacts.json
data/publications.json
data/research-graph.json
assets/papers/*
```



## Excerpts / abstracts

Do not add a short excerpt from the title alone. Add `abstract` text only after reading the paper PDF, especially the abstract, introduction, contribution paragraph, and conclusion. Then set:

```json
"abstract": "Carefully written excerpt based on the paper.",
"abstractReviewed": true
```

If `abstractReviewed` is not `true`, the website will not show an excerpt in the graph detail panel.


## Graph label guidance

Graph nodes use the `shortTitle` field from `data/artifacts.json` / `data/publications.json`. Keep this label short enough to fit cleanly in the map, but still faithful to the paper. Good examples: `Mutation Search`, `SparkLeBLAST`, `CT Enhancement`, `Arrow / MPI`, `Interactive Projections`. Avoid long full-title fragments or vague nicknames. The full title, venue, authors, and excerpt appear after the node is clicked.

## v17 paper map interaction model

The homepage paper map is designed to scale beyond a small number of publications.

- Cluster labels describe topical areas.
- Individual publications are shown as unlabeled markers.
- Hovering over a marker shows the full paper title through the browser tooltip.
- Clicking a marker opens the publication detail panel with authors, venue, reviewed excerpt, and links.
- Clicking a cluster opens a list of publications in that cluster.
- The graph should not show every paper title by default; that becomes unreadable once the publication list grows.

When adding a new publication, set its `areas` field carefully because that controls which cluster it appears in.
