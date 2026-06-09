Put paper PDFs in this folder.

Each publication in `data/artifacts.json` has a `pdfPath`, for example:

```json
"pdfPath": "assets/papers/genomic-needles-ipdps-2026.pdf"
```

When you add the actual PDF file at that path, you can add a visible link by setting:

```json
"links": {
  "pdf": "assets/papers/genomic-needles-ipdps-2026.pdf",
  "arxiv": "https://arxiv.org/abs/2603.16721"
}
```
