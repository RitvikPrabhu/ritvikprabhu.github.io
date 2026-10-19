import rss from "@astrojs/rss";
import { writing } from "../data/content";
import { site } from "../data/site";
import type { APIContext } from "astro";
export async function GET(context: APIContext) {
  return rss({
    title: `${site.name} — Writing`,
    description: site.description,
    site: context.site!,
    items: (await writing()).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.published,
      link: `/writing/${p.id}/`,
    })),
    customData: "<language>en-us</language>",
  });
}
