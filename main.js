document.documentElement.classList.add("js");

const graphPromise = fetch("data/research-graph.json").then(r => r.json()).catch(() => null);
const artifactsPromise = fetch("data/artifacts.json").then(r => r.json()).catch(() => []);

let currentGraph = null;
let currentArtifacts = [];

const colors = {
  publication: "#f5c782",
  journal: "#f3c7a7",
  conference: "#b8d0c5",
  workshop: "#c7bdd8",
  preprint: "#a9bdd6"
};

const defaultClusterNames = ["Scientific HPC", "Data Systems", "Biomedical Imaging", "Interactive ML / Visualization", "Research Tools"];

function typeHeadline() {
  const el = document.querySelector("#typed-headline");
  if (!el) return;
  const text = el.dataset.text || el.textContent || "Hi, I’m Ritvik.";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.textContent = "";
  if (reduce) {
    el.textContent = text;
    document.body.classList.add("headline-complete");
    return;
  }
  let i = 0;
  const step = () => {
    el.textContent = text.slice(0, i);
    i += 1;
    if (i <= text.length) setTimeout(step, i < 5 ? 65 : 48 + Math.random() * 20);
    else window.setTimeout(() => document.body.classList.add("headline-complete"), 120);
  };
  setTimeout(step, 240);
}

document.querySelectorAll("#year").forEach(el => el.textContent = new Date().getFullYear());
typeHeadline();

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"]/g, ch => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"}[ch]));
}

function formatAuthors(authors = "") {
  const escaped = escapeHTML(authors);
  return escaped
    .replace(/\bR\.?\s+Prabhu\b/g, "<strong>R Prabhu</strong>")
    .replace(/\bRitvik\s+Prabhu\b/g, "<strong>Ritvik Prabhu</strong>");
}

function prettyLabel(label) {
  const map = { pdf: "PDF", paper: "Paper", code: "Code", slides: "Slides", bibtex: "BibTeX", arxiv: "arXiv", doi: "DOI" };
  return map[label.toLowerCase()] || label.replace(/^./, c => c.toUpperCase());
}

function linkifyLinks(links = {}, item = {}) {
  const order = ["pdf", "paper", "arxiv", "doi", "code", "slides", "bibtex"];
  const merged = { ...(links || {}) };
  // Only show local PDF paths once you have actually added the file and set links.pdf or pdfPath.
  if (!merged.pdf && item.pdfPath && !item.pdfPath.includes("README")) merged.pdf = item.pdfPath;
  const entries = Object.entries(merged).filter(([, href]) => href && href !== "#");
  entries.sort(([a], [b]) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)));
  if (!entries.length) return `<span class="link-placeholder">Links soon</span>`;
  return entries.map(([label, href]) => `<a href="${escapeHTML(href)}" target="_blank" rel="noopener">${prettyLabel(label)}</a>`).join("");
}

function sortArtifacts(a, b) {
  const y = (b.year || 0) - (a.year || 0);
  if (y !== 0) return y;
  const ao = Number.isFinite(a.sortOrder) ? a.sortOrder : 999;
  const bo = Number.isFinite(b.sortOrder) ? b.sortOrder : 999;
  if (ao !== bo) return ao - bo;
  return String(a.title).localeCompare(String(b.title));
}

function venueLine(item) {
  const parts = [item.venue, item.year].filter(Boolean);
  return parts.map(escapeHTML).join(" · ");
}

function statusLabel(item) {
  const raw = String(item.status || "Published").toLowerCase();
  return raw.includes("appear") ? "To appear" : "Published";
}

function publicationCard(item) {
  const status = statusLabel(item);
  const badgeClass = status === "To appear" ? "to-appear" : "published";
  return `
    <article class="publication">
      <div>
        <h3>${escapeHTML(item.title)}</h3>
        <p class="authors">${formatAuthors(item.authors || "")}</p>
        <p class="pub-venue">${venueLine(item)}</p>
      </div>
      <div class="pub-actions">
        <span class="status-badge ${badgeClass}">${status}</span>
        <div class="pub-links">${linkifyLinks(item.links, item)}</div>
      </div>
    </article>
  `;
}

function renderRecentPublications(artifacts) {
  const list = document.querySelector("#publication-list");
  if (!list) return;
  const pubs = artifacts.filter(item => item.type === "publication").sort(sortArtifacts).slice(0, Number(list.dataset.limit || 3));
  list.innerHTML = pubs.length ? pubs.map(publicationCard).join("") : `<p>No publication entries yet.</p>`;
}

function renderFullPublications(artifacts) {
  const host = document.querySelector("#publication-full-list");
  if (!host) return;
  const categories = [
    { key: "Papers", label: "Full papers" },
    { key: "Workshop Papers", label: "Workshop papers" },
    { key: "Preprints", label: "Preprints" }
  ];
  const pubs = artifacts.filter(item => item.type === "publication").sort(sortArtifacts);
  host.innerHTML = categories.map(category => {
    const items = pubs.filter(item => (item.category || "Papers") === category.key);
    if (!items.length) return "";
    return `
      <section class="publication-category">
        <h2>${escapeHTML(category.label)}</h2>
        <div class="publication-list">${items.map(publicationCard).join("")}</div>
      </section>
    `;
  }).join("");
}

function artifactIdFromNode(node) {
  return node.id?.startsWith("artifact:") ? node.id.replace("artifact:", "") : null;
}

function nodeShortLabel(node) {
  const artifactId = artifactIdFromNode(node);
  const artifact = currentArtifacts.find(a => a.id === artifactId);
  return artifact?.shortTitle || node.label || "Paper";
}

function wrapNodeLabel(label, maxChars = 20) {
  const words = String(label || "Paper").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= 2) return lines;
  return [lines[0], `${lines.slice(1).join(" ").slice(0, maxChars - 1)}…`];
}

function nodeVenueLabel(node) {
  const artifactId = artifactIdFromNode(node);
  const artifact = currentArtifacts.find(a => a.id === artifactId);
  const venue = artifact?.venueShort || node.venueShort || "";
  const year = artifact?.year || node.year || "";
  if (!venue && !year) return "";
  const shortYear = String(year).slice(-2);
  return venue && shortYear ? `${venue} ’${shortYear}` : `${venue}${year}`;
}

function hash(value) {
  let h = 2166136261;
  for (const ch of String(value)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Math.abs(h >>> 0);
}

function nodeCluster(node) {
  const artifactId = artifactIdFromNode(node);
  const artifact = currentArtifacts.find(a => a.id === artifactId);
  return artifact?.areas?.[0] || "Published artifacts";
}

function clusterNames(graph) {
  return graph?.clusters?.length ? graph.clusters : defaultClusterNames;
}

function areaCenters(width, height, names) {
  const layout = {};
  const count = Math.max(1, names.length);
  const cx = width / 2;
  const cy = height / 2;
  const radiusX = width * 0.30;
  const radiusY = height * 0.27;
  const regionRx = count > 4 ? width * 0.18 : width * 0.23;
  const regionRy = count > 4 ? height * 0.14 : height * 0.18;
  names.forEach((area, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / count);
    layout[area] = { x: cx + Math.cos(angle) * radiusX, y: cy + Math.sin(angle) * radiusY, rx: regionRx, ry: regionRy };
  });
  return layout;
}

function setDetail(node) {
  const detail = document.querySelector("#node-detail");
  if (!detail) return;
  const artifactId = artifactIdFromNode(node);
  const artifact = currentArtifacts.find(a => a.id === artifactId);
  const close = `<button class="detail-close" aria-label="Close details">×</button>`;
  if (!artifact) return;
  detail.innerHTML = `${close}
    <h3>${escapeHTML(artifact.title)}</h3>
    <p class="authors">${formatAuthors(artifact.authors || "")}</p>
    <p class="pub-venue">${venueLine(artifact)}</p>
    <p>${escapeHTML(artifact.abstract || artifact.summary || "")}</p>
    <div class="pub-links detail-links">${linkifyLinks(artifact.links, artifact)}</div>
  `;
  detail.classList.add("open");
  detail.querySelector(".detail-close")?.addEventListener("click", () => detail.classList.remove("open"));
}

function initialLayout(nodes, width, height, graph) {
  const names = clusterNames(graph);
  const centers = areaCenters(width, height, names);
  let ordinal = 0;
  for (const node of nodes) {
    node.cluster = nodeCluster(node);
    const c = centers[node.cluster] || { x: width / 2, y: height / 2, rx: width * 0.25, ry: height * 0.18 };
    const angle = ((hash(node.id) % 628) / 100) + ordinal * 0.74;
    ordinal += 1;
    node.x = c.x + Math.cos(angle) * c.rx * 0.45;
    node.y = c.y + Math.sin(angle) * c.ry * 0.45;
    node.vx = 0; node.vy = 0;
    node.r = 58;
  }
}

function simulate(nodes, links, width, height, graph, ticks = 260) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const preparedLinks = links.map(e => ({ ...e, sourceNode: byId.get(e.source), targetNode: byId.get(e.target) })).filter(e => e.sourceNode && e.targetNode);
  const names = clusterNames(graph);
  const centers = areaCenters(width, height, names);
  for (let t = 0; t < ticks; t++) {
    const alpha = 0.07 * (1 - t / ticks);
    for (const e of preparedLinks) {
      const s = e.sourceNode, d = e.targetNode;
      const dx = d.x - s.x, dy = d.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const desired = 170;
      const force = (dist - desired) * 0.006 * Math.min(4, e.weight || 1) * alpha;
      const fx = dx / dist * force, fy = dy / dist * force;
      s.vx += fx; s.vy += fy; d.vx -= fx; d.vy -= fy;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy + 0.01;
        const dist = Math.sqrt(dist2);
        const minDist = a.r + b.r + 28;
        const repulse = Math.min(6, 5200 / dist2) * alpha;
        const fx = dx / dist * repulse, fy = dy / dist * repulse;
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
        if (dist < minDist) {
          const push = (minDist - dist) * 0.04;
          a.vx -= dx / dist * push; a.vy -= dy / dist * push;
          b.vx += dx / dist * push; b.vy += dy / dist * push;
        }
      }
    }
    for (const n of nodes) {
      const c = centers[n.cluster] || { x: width / 2, y: height / 2 };
      n.vx += (c.x - n.x) * 0.0012;
      n.vy += (c.y - n.y) * 0.0012;
      n.vx *= 0.84; n.vy *= 0.84;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(50, Math.min(height - 50, n.y));
    }
  }
  return preparedLinks;
}

function categoryColor(node) {
  const artifactId = artifactIdFromNode(node);
  const item = currentArtifacts.find(a => a.id === artifactId);
  const cat = (item?.category || "Papers").toLowerCase();
  if (cat.includes("workshop")) return colors.workshop;
  if (cat.includes("preprint")) return colors.preprint;
  if ((item?.venue || "").toLowerCase().includes("transactions")) return colors.journal;
  return colors.conference;
}

function renderGraph(graph) {
  const host = document.querySelector("#graph");
  if (!host || !graph) return;
  const width = host.clientWidth || 760;
  const height = host.clientHeight || 650;
  const nodes = graph.nodes.map(n => ({ ...n }));
  initialLayout(nodes, width, height, graph);
  const links = simulate(nodes, graph.edges || [], width, height, graph);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const edgeGroup = document.createElementNS(svgNS, "g");
  for (const e of links) {
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", e.sourceNode.x); line.setAttribute("y1", e.sourceNode.y); line.setAttribute("x2", e.targetNode.x); line.setAttribute("y2", e.targetNode.y);
    line.setAttribute("stroke-width", Math.max(0.8, Math.min(3, e.weight || 1))); line.setAttribute("class", "edge");
    edgeGroup.appendChild(line);
  }
  svg.appendChild(edgeGroup);

  const nodeGroup = document.createElementNS(svgNS, "g");
  for (const node of nodes) {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "node node-publication");
    g.setAttribute("transform", `translate(${node.x},${node.y})`);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", `Show details for ${node.label || node.id}`);
    const title = document.createElementNS(svgNS, "title");
    title.textContent = node.label || node.id;
    g.appendChild(title);
    g.addEventListener("click", () => setDetail(node));
    g.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") setDetail(node); });
    const lines = wrapNodeLabel(nodeShortLabel(node), 21);
    const longest = Math.max(...lines.map(line => line.length));
    const pillWidth = Math.max(132, Math.min(220, longest * 7.2 + 34));
    const pillHeight = 22 + lines.length * 16;

    const pill = document.createElementNS(svgNS, "rect");
    pill.setAttribute("x", -pillWidth / 2);
    pill.setAttribute("y", -pillHeight / 2);
    pill.setAttribute("width", pillWidth);
    pill.setAttribute("height", pillHeight);
    pill.setAttribute("rx", 18);
    pill.setAttribute("class", "node-pill-bg");
    pill.setAttribute("fill", categoryColor(node));
    g.appendChild(pill);

    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("r", 4.5);
    dot.setAttribute("cx", -pillWidth / 2 + 16);
    dot.setAttribute("cy", 0);
    dot.setAttribute("class", "node-dot");
    g.appendChild(dot);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "artifact-label");
    const firstDy = lines.length === 1 ? 4 : -4;
    lines.forEach((line, idx) => {
      const tspan = document.createElementNS(svgNS, "tspan");
      tspan.setAttribute("x", 5);
      tspan.setAttribute("dy", idx === 0 ? firstDy : 15);
      tspan.textContent = line;
      text.appendChild(tspan);
    });

    g.appendChild(text);
    nodeGroup.appendChild(g);
  }
  svg.appendChild(nodeGroup);
  const legend = document.createElement("div");
  legend.className = "graph-legend";
  legend.innerHTML = `<span><b>${nodes.length}</b> published works</span><span>Click a node for details and links</span>`;
  host.replaceChildren(svg, legend);
}

Promise.all([graphPromise, artifactsPromise]).then(([graph, artifacts]) => {
  currentGraph = graph;
  currentArtifacts = artifacts;
  renderRecentPublications(artifacts);
  renderFullPublications(artifacts);
  renderGraph(graph);
  window.addEventListener("resize", () => renderGraph(graph));
});
