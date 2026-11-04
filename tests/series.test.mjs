import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
  mkdtempSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const primary = "first-principles-to-modern-llms";
const catalogPath = "src/data/series.json";
const catalog = () => JSON.parse(readFileSync(catalogPath, "utf8"));

test("series cards lead directly to ordered published post cards and articles", (t) => {
  const output = mkdtempSync(join(tmpdir(), "series-test-"));
  t.after(() => rmSync(output, { recursive: true, force: true }));
  const build = () =>
    execFileSync("npm", ["run", "build", "--", "--outDir", output], {
      stdio: "pipe",
    });
  const html = (path) => readFileSync(join(output, path), "utf8");
  const fixtures = [];
  const post = (slug, series, order, published, draft = false) => {
    const path = `src/content/writing/series-test-${slug}.md`;
    assert.ok(!existsSync(path) || fixtures.includes(path));
    if (!fixtures.includes(path)) fixtures.push(path);
    writeFileSync(
      path,
      `---
title: "Fixture ${slug}"
description: "Temporary publishing test, not an article."
published: ${published}
draft: ${draft}
${series ? `series:\n  id: ${series}\n  order: ${order}` : ""}
---
## The question
## The mathematics
## The implementation
## The experiment
## The next limitation
`,
    );
  };
  const original = readFileSync(catalogPath, "utf8");
  assert.ok(!catalog().some((s) => s.id === "series-test-other"));
  try {
    writeFileSync(
      catalogPath,
      JSON.stringify([
        ...catalog(),
        {
          id: "series-test-other",
          title: "Fixture other series",
          description: "Temporary series for isolation testing.",
          cover: "/images/llm-series-cover.jpg",
          coverAlt: "Fixture landscape",
        },
      ]),
    );
    post("first", primary, 10, "2026-11-03");
    post("second", primary, 20, "2026-01-01");
    post("draft", primary, 30, "2026-11-02", true);
    post("fourth", primary, 40, "2026-11-01");
    post("other", "series-test-other", 10, "2026-11-02");
    post("unassigned", null, 0, "2026-10-30");
    build();
    const home = html("index.html").split('aria-labelledby="writing-title"')[1];
    assert.equal((home.match(/class="post-row"/g) || []).length, 3);
    assert.ok(home.indexOf("Fixture first") < home.indexOf("Fixture other"));
    assert.ok(home.indexOf("Fixture other") < home.indexOf("Fixture fourth"));
    for (const slug of ["first", "other", "fourth"])
      assert.match(home, new RegExp(`href="/writing/series-test-${slug}/"`));
    assert.doesNotMatch(
      home,
      /Fixture second|Fixture draft|Fixture unassigned/,
    );
    const library = html("writing/index.html");
    assert.match(
      library,
      new RegExp(`class="series-card" href="/writing/series/${primary}/"`),
    );
    assert.match(library, /href="\/writing\/series\/series-test-other\/"/);
    assert.doesNotMatch(
      library.slice(library.indexOf('class="series-library"')),
      /series-test-first|series-test-draft|series-post-card/,
    );
    assert.match(library, /data-search-results hidden/);
    assert.match(library, /data-search-only="true"/);
    assert.match(library, /href="\/writing\/series-test-first\/"/);
    assert.match(library, /href="\/writing\/series-test-other\/"/);
    assert.doesNotMatch(
      library,
      /Fixture draft|Fixture unassigned|Standalone posts/,
    );
    const series = html(`writing/series/${primary}/index.html`);
    assert.equal((series.match(/class="series-post-card"/g) || []).length, 3);
    assert.ok(
      series.indexOf("Fixture first") < series.indexOf("Fixture second"),
    );
    assert.ok(
      series.indexOf("Fixture second") < series.indexOf("Fixture fourth"),
    );
    assert.match(
      series,
      /class="series-post-card" href="\/writing\/series-test-first\/"/,
    );
    assert.doesNotMatch(
      series,
      /Fixture draft|Fixture other|Planned|Act I|FlashAttention/,
    );
    assert.doesNotMatch(
      html("writing/series/series-test-other/index.html"),
      /Fixture first/,
    );
    const first = html("writing/series-test-first/index.html");
    assert.match(first, /You’re at the beginning/);
    assert.match(first, /href="\/writing\/series-test-second\/"/);
    const second = html("writing/series-test-second/index.html");
    assert.match(second, /Post 02 of 3/);
    assert.match(second, /href="\/writing\/series-test-first\/"/);
    assert.match(second, /href="\/writing\/series-test-fourth\/"/);
    assert.doesNotMatch(second, /Fixture draft|Fixture other|Planned/);
    assert.match(second, /aria-label="Table of contents"/);
    assert.match(
      html("writing/series-test-fourth/index.html"),
      /You’re up to date/,
    );
    assert.ok(
      !existsSync(join(output, "writing/series-test-draft/index.html")),
    );
    assert.doesNotMatch(html("rss.xml"), /Fixture draft/);
    assert.doesNotMatch(
      html("sitemap-0.xml"),
      /series-test-draft|series-post|llm-roadmap/,
    );

    post("duplicate", primary, 10, "2026-11-03");
    assert.throws(build, /Duplicate series order/);
    rmSync("src/content/writing/series-test-duplicate.md");
    post("invalid", "not-a-series", 1, "2026-11-03");
    assert.throws(build, /Unknown series/);
  } finally {
    for (const path of fixtures) rmSync(path, { force: true });
    writeFileSync(catalogPath, original);
    build();
  }
  const empty = html(`writing/series/${primary}/index.html`);
  assert.match(empty, /No posts published yet/);
  assert.doesNotMatch(empty, /series-post-card|Act I|Planned|FlashAttention/);
  assert.doesNotMatch(html("writing/index.html"), /Fixture |series-test-/);
});
