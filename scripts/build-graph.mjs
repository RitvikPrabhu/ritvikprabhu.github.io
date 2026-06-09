import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactsPath = path.join(ROOT, "data", "artifacts.json");
const outPath = path.join(ROOT, "data", "research-graph.json");
const allArtifacts = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));

// Homepage graph rule:
// - papers / published research artifacts only
// - no method/concept/root nodes
// - edges are similarity links between artifacts based on shared metadata
const artifacts = allArtifacts
  .filter(item => item.type === "publication")
  .sort((a, b) => (b.year || 0) - (a.year || 0) || (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

const nodes = [];
const edges = [];

function terms(item) {
  return new Set([
    ...(item.areas || []),
    ...(item.keywords || [])
  ].filter(Boolean).map(x => String(x).toLowerCase().trim()));
}

for (const item of artifacts) {
  nodes.push({
    id: `artifact:${item.id}`,
    label: item.shortTitle || item.title,
    fullTitle: item.title,
    venueShort: item.venueShort,
    type: "publication",
    category: item.category || "Papers",
    year: item.year,
    venue: item.venue,
    status: item.status,
    summary: item.summary,
    abstract: item.abstract,
    authors: item.authors,
    links: item.links,
    pdfPath: item.pdfPath,
    areas: item.areas || [],
    weight: 2 + Math.min(3, Math.max(0, 2026 - (item.year || 2020)) * -0.15 + 1.8)
  });
}

for (let i = 0; i < artifacts.length; i++) {
  for (let j = i + 1; j < artifacts.length; j++) {
    const a = artifacts[i];
    const b = artifacts[j];
    const ta = terms(a);
    const shared = [...terms(b)].filter(t => ta.has(t));
    const sameArea = (a.areas || []).some(area => (b.areas || []).includes(area));
    if (shared.length || sameArea) {
      edges.push({
        source: `artifact:${a.id}`,
        target: `artifact:${b.id}`,
        weight: Math.min(5, (sameArea ? 2 : 0) + shared.length * 0.5),
        reasons: shared.slice(0, 6)
      });
    }
  }
}

const clusters = [...new Set(artifacts.flatMap(item => item.areas || []))];

const graph = {
  generatedAt: new Date().toISOString(),
  explanation: "Generated from published research artifacts only. Nodes are papers/preprints/workshop papers; edges indicate shared research metadata.",
  clusters,
  nodes,
  edges
};

fs.writeFileSync(outPath, `${JSON.stringify(graph, null, 2)}\n`);
console.log(`Generated paper-only graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges at ${outPath}`);
