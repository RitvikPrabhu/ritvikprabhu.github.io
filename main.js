document.documentElement.classList.add("js");

const graphPromise = fetch("data/research-graph.json", { cache: "no-store" }).then(r => r.json()).catch(() => null);
const artifactsPromise = fetch("data/artifacts.json", { cache: "no-store" }).then(r => r.json()).catch(() => []);
const newsPromise = fetch("data/news.json", { cache: "no-store" }).then(r => r.json()).catch(() => []);

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

function setupEmailLink() {
  const link = document.querySelector("[data-email-link]");
  if (!link) return;
  const user = ["rit", "vik"].join("");
  const host = ["ritvikprabhu", "com"].join(".");
  link.addEventListener("click", event => {
    event.preventDefault();
    window.open(`mailto:${user}@${host}`, "_blank", "noopener");
  });
}

setupEmailLink();

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
  const statusNote = status === "To appear" ? ` <span class="pub-status-note">(to appear)</span>` : "";
  return `
    <article class="publication">
      <div>
        <h3>${escapeHTML(item.title)}</h3>
        <p class="authors">${formatAuthors(item.authors || "")}</p>
        <p class="pub-venue">${venueLine(item)}${statusNote}</p>
      </div>
      <div class="pub-actions">
        <div class="pub-links">${linkifyLinks(item.links, item)}</div>
      </div>
    </article>
  `;
}

function newsCard(item) {
  const link = item.link
    ? `<a class="news-link" href="${escapeHTML(item.link)}" target="_blank" rel="noopener">More</a>`
    : "";
  return `
    <article class="news-item">
      <time class="news-date">${escapeHTML(item.date || "")}</time>
      <h3>${escapeHTML(item.title || "")}</h3>
      ${link}
    </article>
  `;
}

function renderRecentNews(news) {
  const list = document.querySelector("#news-list");
  if (!list) return;
  const items = news.slice(0, Number(list.dataset.limit || 3));
  list.innerHTML = items.length ? items.map(newsCard).join("") : `<p>No news entries yet.</p>`;
}

function renderRecentPublications(artifacts) {
  const list = document.querySelector("#publication-list");
  if (!list) return;
  const pubs = artifacts.filter(item => item.type === "publication").sort(sortArtifacts).slice(0, Number(list.dataset.limit || 3));
  list.innerHTML = pubs.length ? pubs.map(publicationCard).join("") : `<p>No publication entries yet.</p>`;
}

function isJournalPublication(item) {
  const category = String(item.category || "").toLowerCase();
  if (category === "journal papers" || category === "journal") return true;
  const venue = String(item.venue || "").toLowerCase();
  return /\b(journal|transactions|letters|magazine)\b/.test(venue);
}

function isConferencePublication(item) {
  const category = item.category || "Papers";
  return (category === "Papers" || category === "Conference Papers") && !isJournalPublication(item);
}

function renderFullPublications(artifacts) {
  const host = document.querySelector("#publication-full-list");
  if (!host) return;
  const categories = [
    {
      id: "conference-papers",
      label: "Conference Papers",
      test: isConferencePublication
    },
    {
      id: "journal-papers",
      label: "Journal Papers",
      test: isJournalPublication
    },
    {
      id: "workshop-papers",
      label: "Workshop Papers",
      test: item => item.category === "Workshop Papers"
    },
    {
      id: "preprints",
      label: "Preprints",
      test: item => item.category === "Preprints"
    }
  ];
  const pubs = artifacts.filter(item => item.type === "publication").sort(sortArtifacts);
  const visibleCategories = categories
    .map(category => ({ ...category, items: pubs.filter(category.test) }))
    .filter(category => category.items.length);
  const jumpNav = document.querySelector("#publication-jump-nav");
  if (jumpNav) {
    jumpNav.innerHTML = visibleCategories
      .map(category => `<a href="#${category.id}">${escapeHTML(category.label)}</a>`)
      .join("");
    jumpNav.hidden = visibleCategories.length < 2;
  }
  host.innerHTML = visibleCategories.map(category => {
    return `
      <section class="publication-category" id="${category.id}">
        <h2>${escapeHTML(category.label)}</h2>
        <div class="publication-list">${category.items.map(publicationCard).join("")}</div>
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


function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  // Fixed, roomy layout for the small number of publication clusters.
  // Cluster titles sit near the top of each oval; nodes are constrained below that title band.
  const base = {
    "Scientific HPC": { x: width * 0.50, y: height * 0.25, rx: width * 0.19, ry: height * 0.13 },
    "Interactive ML / Visualization": { x: width * 0.25, y: height * 0.46, rx: width * 0.19, ry: height * 0.15 },
    "Biomedical Imaging": { x: width * 0.33, y: height * 0.73, rx: width * 0.18, ry: height * 0.13 },
    "Data Systems": { x: width * 0.66, y: height * 0.73, rx: width * 0.18, ry: height * 0.13 },
    "Research Tools": { x: width * 0.78, y: height * 0.46, rx: width * 0.18, ry: height * 0.14 }
  };
  const fallback = {};
  const count = Math.max(1, names.length);
  const cx = width / 2;
  const cy = height / 2;
  const radiusX = width * 0.30;
  const radiusY = height * 0.27;
  names.forEach((area, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / count);
    fallback[area] = { x: cx + Math.cos(angle) * radiusX, y: cy + Math.sin(angle) * radiusY, rx: width * 0.18, ry: height * 0.14 };
  });
  return Object.fromEntries(names.map(name => [name, base[name] || fallback[name]]));
}


function detailCloseButton() {
  return `<button class="detail-close" aria-label="Close details">×</button>`;
}

function setDetail(node) {
  const detail = document.querySelector("#node-detail");
  if (!detail) return;
  const artifactId = artifactIdFromNode(node);
  const artifact = currentArtifacts.find(a => a.id === artifactId);
  if (!artifact) return;
  const reviewedAbstract = artifact.abstractReviewed === true && artifact.abstract
    ? `<p class="detail-abstract">${escapeHTML(artifact.abstract)}</p>`
    : "";
  detail.innerHTML = `${detailCloseButton()}
    <p class="detail-kicker">Publication</p>
    <h3>${escapeHTML(artifact.title)}</h3>
    <p class="authors">${formatAuthors(artifact.authors || "")}</p>
    <p class="pub-venue">${venueLine(artifact)}</p>
    ${reviewedAbstract}
    <div class="pub-links detail-links">${linkifyLinks(artifact.links, artifact)}</div>
  `;
  detail.classList.add("open");
  detail.querySelector(".detail-close")?.addEventListener("click", () => detail.classList.remove("open"));
}

function setClusterDetail(clusterName, nodes) {
  const detail = document.querySelector("#node-detail");
  if (!detail) return;
  const artifacts = nodes
    .map(node => currentArtifacts.find(a => a.id === artifactIdFromNode(node)))
    .filter(Boolean)
    .sort(sortArtifacts);
  const items = artifacts.map(item => `
    <button class="cluster-paper" data-paper-id="${escapeHTML(item.id)}">
      <span>${escapeHTML(item.title)}</span>
      <small>${venueLine(item)}</small>
    </button>
  `).join("");
  detail.innerHTML = `${detailCloseButton()}
    <p class="detail-kicker">Cluster</p>
    <h3>${escapeHTML(clusterName)}</h3>
    <p class="cluster-summary">${artifacts.length} ${artifacts.length === 1 ? "publication" : "publications"} in this area.</p>
    <div class="cluster-paper-list">${items || "<p>No publications in this cluster yet.</p>"}</div>
  `;
  detail.classList.add("open");
  detail.querySelector(".detail-close")?.addEventListener("click", () => detail.classList.remove("open"));
  detail.querySelectorAll(".cluster-paper").forEach(button => {
    button.addEventListener("click", () => {
      const artifact = currentArtifacts.find(a => a.id === button.dataset.paperId);
      const node = currentGraph?.nodes?.find(n => artifactIdFromNode(n) === artifact?.id);
      if (node) setDetail(node);
    });
  });
}

function initialLayout(nodes, width, height, graph) {
  const names = clusterNames(graph);
  const centers = areaCenters(width, height, names);
  const perCluster = new Map();
  for (const node of nodes) {
    node.cluster = nodeCluster(node);
    const idx = perCluster.get(node.cluster) || 0;
    perCluster.set(node.cluster, idx + 1);
    const c = centers[node.cluster] || { x: width / 2, y: height / 2, rx: width * 0.25, ry: height * 0.18 };
    const angle = ((hash(node.id) % 628) / 100) + idx * 1.35;
    const radiusScale = 0.36 + (idx % 3) * 0.07;
    node.x = c.x + Math.cos(angle) * c.rx * radiusScale;
    node.y = c.y + 28 + Math.sin(angle) * c.ry * Math.min(0.46, radiusScale);
    node.vx = 0; node.vy = 0;
    node.r = 12;
  }
}

function simulate(nodes, links, width, height, graph, ticks = 220) {
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
      const desired = 130;
      const force = (dist - desired) * 0.005 * Math.min(4, e.weight || 1) * alpha;
      const fx = dx / dist * force, fy = dy / dist * force;
      s.vx += fx; s.vy += fy; d.vx -= fx; d.vy -= fy;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy + 0.01;
        const dist = Math.sqrt(dist2);
        const minDist = a.r + b.r + 14;
        const repulse = Math.min(5, 1800 / dist2) * alpha;
        const fx = dx / dist * repulse, fy = dy / dist * repulse;
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
        if (dist < minDist) {
          const push = (minDist - dist) * 0.06;
          a.vx -= dx / dist * push; a.vy -= dy / dist * push;
          b.vx += dx / dist * push; b.vy += dy / dist * push;
        }
      }
    }
    for (const n of nodes) {
      const c = centers[n.cluster] || { x: width / 2, y: height / 2 };
      n.vx += (c.x - n.x) * 0.0014;
      n.vy += (c.y + 22 - n.y) * 0.0014;
      n.vx *= 0.84; n.vy *= 0.84;
      n.x += n.vx; n.y += n.vy;
      const topSafe = (c.ry ? c.y - c.ry + 86 : 50);
      const bottomSafe = (c.ry ? c.y + c.ry - 34 : height - 50);
      const leftSafe = (c.rx ? c.x - c.rx + 34 : 40);
      const rightSafe = (c.rx ? c.x + c.rx - 34 : width - 40);
      n.x = Math.max(leftSafe, Math.min(rightSafe, n.x));
      n.y = Math.max(topSafe, Math.min(bottomSafe, n.y));
    }
  }
  return preparedLinks;
}

function statusColor(node) {
  const artifactId = artifactIdFromNode(node);
  const item = currentArtifacts.find(a => a.id === artifactId);
  return statusLabel(item || {}) === "To appear" ? "#e7a347" : "#6eb083";
}

function categoryShape(node) {
  const artifactId = artifactIdFromNode(node);
  const item = currentArtifacts.find(a => a.id === artifactId);
  const cat = (item?.category || "Papers").toLowerCase();
  if (cat.includes("workshop")) return "diamond";
  if (cat.includes("preprint")) return "hollow";
  return "circle";
}

function tooltipText(node) {
  const artifact = currentArtifacts.find(a => a.id === artifactIdFromNode(node));
  if (!artifact) return node.label || "Publication";
  const status = statusLabel(artifact);
  return `${artifact.title}\n${venueLine(artifact)} · ${status}`;
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

  const clusterGroup = document.createElementNS(svgNS, "g");
  const names = clusterNames(graph);
  const centers = areaCenters(width, height, names);
  const nodesByCluster = Object.fromEntries(names.map(name => [name, nodes.filter(n => n.cluster === name)]));
  for (const name of names) {
    const c = centers[name];
    if (!c) continue;

    const region = document.createElementNS(svgNS, "ellipse");
    region.setAttribute("cx", c.x);
    region.setAttribute("cy", c.y);
    region.setAttribute("rx", c.rx);
    region.setAttribute("ry", c.ry);
    region.setAttribute("class", `cluster-region cluster-${slugify(name)}`);
    region.setAttribute("tabindex", "0");
    region.setAttribute("role", "button");
    region.setAttribute("aria-label", `Show publications in ${name}`);
    region.addEventListener("click", () => setClusterDetail(name, nodesByCluster[name] || []));
    region.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") setClusterDetail(name, nodesByCluster[name] || []); });
    clusterGroup.appendChild(region);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", c.x);
    label.setAttribute("y", c.y - c.ry + 32);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "cluster-label");
    label.textContent = name;
    clusterGroup.appendChild(label);
  }
  svg.appendChild(clusterGroup);

  const edgeGroup = document.createElementNS(svgNS, "g");
  for (const e of links) {
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", e.sourceNode.x); line.setAttribute("y1", e.sourceNode.y); line.setAttribute("x2", e.targetNode.x); line.setAttribute("y2", e.targetNode.y);
    line.setAttribute("stroke-width", Math.max(0.8, Math.min(2.4, e.weight || 1))); line.setAttribute("class", "edge");
    edgeGroup.appendChild(line);
  }
  svg.appendChild(edgeGroup);

  const nodeGroup = document.createElementNS(svgNS, "g");
  for (const node of nodes) {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "node node-publication node-marker");
    g.setAttribute("transform", `translate(${node.x},${node.y})`);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", `Show details for ${node.fullTitle || node.label || node.id}`);
    const title = document.createElementNS(svgNS, "title");
    title.textContent = tooltipText(node);
    g.appendChild(title);
    g.addEventListener("click", () => setDetail(node));
    g.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") setDetail(node); });

    const color = statusColor(node);
    const shape = categoryShape(node);
    if (shape === "diamond") {
      const diamond = document.createElementNS(svgNS, "rect");
      diamond.setAttribute("x", -9); diamond.setAttribute("y", -9);
      diamond.setAttribute("width", 18); diamond.setAttribute("height", 18);
      diamond.setAttribute("rx", 3);
      diamond.setAttribute("transform", "rotate(45)");
      diamond.setAttribute("fill", color);
      diamond.setAttribute("class", "paper-dot paper-dot-workshop");
      g.appendChild(diamond);
    } else {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("r", shape === "hollow" ? 8.5 : 9.5);
      circle.setAttribute("fill", shape === "hollow" ? "rgba(255,250,242,.86)" : color);
      circle.setAttribute("stroke", color);
      circle.setAttribute("stroke-width", shape === "hollow" ? 2.4 : 1.4);
      circle.setAttribute("class", `paper-dot paper-dot-${shape}`);
      g.appendChild(circle);
    }

    nodeGroup.appendChild(g);
  }
  svg.appendChild(nodeGroup);
  const legend = document.createElement("div");
  legend.className = "graph-legend";
  legend.innerHTML = `
    <span><b>${nodes.length}</b> publications</span>
    <span><i class="legend-dot published"></i>Published</span>
    <span><i class="legend-dot to-appear"></i>To appear</span>
    <span>Click clusters or papers</span>
  `;
  host.replaceChildren(svg, legend);
}

Promise.all([graphPromise, artifactsPromise, newsPromise]).then(([graph, artifacts, news]) => {
  currentGraph = graph;
  currentArtifacts = artifacts;
  renderRecentNews(news);
  renderRecentPublications(artifacts);
  renderFullPublications(artifacts);
  renderGraph(graph);
  window.addEventListener("resize", () => renderGraph(graph));
});
