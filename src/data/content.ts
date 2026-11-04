import { getCollection, type CollectionEntry } from "astro:content";
export async function publications() {
  return (await getCollection("publications")).sort(
    (a, b) => b.data.year - a.data.year || a.data.sortOrder - b.data.sortOrder,
  );
}
export async function writing() {
  const posts = (
    await getCollection("writing", ({ data }) => !data.draft && !data.example)
  ).sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
  const seriesIds = new Set((await getCollection("series")).map((s) => s.id));
  const assigned = new Set<string>();
  for (const post of posts) {
    const series = post.data.series;
    if (!series) continue;
    if (!seriesIds.has(series.id.id))
      throw new Error(`Unknown series: ${series.id.id}`);
    const position = `${series.id.id}/${series.order}`;
    if (assigned.has(position))
      throw new Error(`Duplicate series order: ${position}`);
    assigned.add(position);
  }
  return posts;
}
export function seriesPosts(id: string, posts: CollectionEntry<"writing">[]) {
  return posts
    .filter((p) => p.data.series?.id.id === id)
    .sort((a, b) => a.data.series!.order - b.data.series!.order);
}
export function date(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
