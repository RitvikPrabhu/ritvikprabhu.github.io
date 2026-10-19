import { getCollection } from "astro:content";
export async function publications() {
  return (await getCollection("publications")).sort(
    (a, b) => b.data.year - a.data.year || a.data.sortOrder - b.data.sortOrder,
  );
}
export async function writing() {
  return (
    await getCollection("writing", ({ data }) => !data.draft && !data.example)
  ).sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}
export function date(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
